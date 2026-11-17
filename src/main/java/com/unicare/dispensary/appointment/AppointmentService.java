package com.unicare.dispensary.appointment;

import com.unicare.dispensary.student.Student;
import com.unicare.dispensary.student.StudentRepository;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AppointmentService {
    private static final List<AppointmentStatus> OCCUPYING =
        List.of(AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED, AppointmentStatus.RESCHEDULE_REQUESTED);
    private final AppointmentRepository appointments;
    private final StudentRepository students;

    public AppointmentService(AppointmentRepository appointments, StudentRepository students) {
        this.appointments=appointments; this.students=students;
    }

    @Transactional
    public AppointmentResponse book(String email, AppointmentRequest request) {
        Student student=student(email);
        validateSlot(request.date(), request.time());
        if (appointments.existsByAppointmentDateAndAppointmentTimeAndStatusIn(request.date(), request.time(), OCCUPYING)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "That appointment time is already booked.");
        }
        return AppointmentResponse.from(appointments.save(new Appointment(student, request.service().trim(),
            request.visitType().trim(), request.date(), request.time(), request.reason().trim(), clean(request.notes()))));
    }

    @Transactional(readOnly=true)
    public List<AppointmentResponse> forStudent(String email) {
        Student student=student(email);
        return appointments.findByStudentIdOrderByAppointmentDateDescAppointmentTimeDesc(student.getId())
            .stream().map(AppointmentResponse::from).toList();
    }

    @Transactional
    public void cancelStudent(String email, Long id) {
        Appointment appointment=owned(email,id);
        if (appointment.getStatus()!=AppointmentStatus.PENDING && appointment.getStatus()!=AppointmentStatus.CONFIRMED)
            throw new ResponseStatusException(HttpStatus.CONFLICT,"This appointment can no longer be cancelled.");
        appointment.setStatus(AppointmentStatus.CANCELLED);
    }

    @Transactional
    public AppointmentResponse requestReschedule(String email, Long id, RescheduleRequest request) {
        Appointment appointment=owned(email,id);
        if (appointment.getStatus()!=AppointmentStatus.PENDING && appointment.getStatus()!=AppointmentStatus.CONFIRMED)
            throw new ResponseStatusException(HttpStatus.CONFLICT,"This appointment cannot be rescheduled.");
        validateSlot(request.date(), request.time());
        if (appointments.existsByAppointmentDateAndAppointmentTimeAndStatusInAndIdNot(request.date(),request.time(),OCCUPYING,id))
            throw new ResponseStatusException(HttpStatus.CONFLICT,"That appointment time is already booked.");
        appointment.requestReschedule(request.date(),request.time());
        return AppointmentResponse.from(appointment);
    }

    @Transactional(readOnly=true)
    public List<AppointmentResponse> allForStaff() {
        return appointments.findAll().stream().map(AppointmentResponse::from).toList();
    }

    @Transactional
    public AppointmentResponse updateForStaff(Long id, StaffAppointmentUpdate update, String staffEmail) {
        Appointment appointment=find(id);
        AppointmentStatus current=appointment.getStatus(), next=update.status();
        if (current==AppointmentStatus.RESCHEDULE_REQUESTED && next==AppointmentStatus.RESCHEDULE_DECLINED) {
            appointment.resolveReschedule(false);
            appointment.setStaffNotes(clean(update.staffNotes()));
            appointment.setReviewedBy(staffEmail);
            return AppointmentResponse.from(appointment);
        }
        if (current==AppointmentStatus.RESCHEDULE_REQUESTED && next==AppointmentStatus.CONFIRMED) {
            if (appointments.existsByAppointmentDateAndAppointmentTimeAndStatusInAndIdNot(
                    appointment.getRequestedDate(), appointment.getRequestedTime(), OCCUPYING, id))
                throw new ResponseStatusException(HttpStatus.CONFLICT,"The requested time is already booked.");
            appointment.resolveReschedule(true);
            appointment.setStaffNotes(clean(update.staffNotes()));
            appointment.setReviewedBy(staffEmail);
            return AppointmentResponse.from(appointment);
        }
        boolean allowed=next==current
            || (current==AppointmentStatus.PENDING && (next==AppointmentStatus.CONFIRMED||next==AppointmentStatus.CANCELLED))
            || (current==AppointmentStatus.CONFIRMED && (next==AppointmentStatus.COMPLETED||next==AppointmentStatus.CANCELLED));
        if (!allowed) throw new ResponseStatusException(HttpStatus.CONFLICT,"Invalid appointment status change.");
        appointment.setStatus(next); appointment.setStaffNotes(clean(update.staffNotes())); appointment.setReviewedBy(staffEmail);
        return AppointmentResponse.from(appointment);
    }

    @Transactional
    public AppointmentResponse decideReschedule(Long id, boolean approve, String staffEmail) {
        Appointment appointment=find(id);
        if (appointment.getStatus()!=AppointmentStatus.RESCHEDULE_REQUESTED)
            throw new ResponseStatusException(HttpStatus.CONFLICT,"No reschedule request is pending.");
        if (approve && appointments.existsByAppointmentDateAndAppointmentTimeAndStatusInAndIdNot(
                appointment.getRequestedDate(),appointment.getRequestedTime(),OCCUPYING,id))
            throw new ResponseStatusException(HttpStatus.CONFLICT,"The requested time is already booked.");
        appointment.resolveReschedule(approve); appointment.setReviewedBy(staffEmail);
        return AppointmentResponse.from(appointment);
    }

    private Student student(String email) {
        return students.findByEmailIgnoreCase(email).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,"Student account not found."));
    }
    private Appointment owned(String email, Long id) {
        Appointment appointment=find(id);
        if (!appointment.getStudent().getEmail().equalsIgnoreCase(email)) throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Appointment not found.");
        return appointment;
    }
    private Appointment find(Long id) {
        return appointments.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,"Appointment not found."));
    }
    private static void validateSlot(LocalDate date, LocalTime time) {
        if (date.isBefore(LocalDate.now())) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Appointment date must be today or later.");
        if (date.getDayOfWeek()==DayOfWeek.SATURDAY || date.getDayOfWeek()==DayOfWeek.SUNDAY)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Appointments are available on weekdays only.");
        if (time.getMinute()!=0 || time.getSecond()!=0 || time.isBefore(LocalTime.of(8,0)) || time.isAfter(LocalTime.of(16,0)))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Choose an available hour between 08:00 and 16:00.");
    }
    private static String clean(String value) { return value==null||value.isBlank()?null:value.trim(); }
}
