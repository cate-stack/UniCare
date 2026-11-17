package com.unicare.dispensary.appointment;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public record AppointmentResponse(Long id, Long studentId, String studentName, String studentNumber,
    String service, String visitType, LocalDate date, LocalTime time, String reason, String notes,
    AppointmentStatus status, RescheduleSummary rescheduleRequest, String staffNotes,
    String reviewedBy, LocalDateTime createdAt) {
    static AppointmentResponse from(Appointment a) {
        return new AppointmentResponse(a.getId(), a.getStudent().getId(), a.getStudent().getFullName(),
            a.getStudent().getStudentNumber(), a.getService(), a.getVisitType(), a.getAppointmentDate(),
            a.getAppointmentTime(), a.getReason(), a.getNotes(), a.getStatus(),
            a.getRequestedDate()==null?null:new RescheduleSummary(a.getRequestedDate(),a.getRequestedTime()),
            a.getStaffNotes(), a.getReviewedBy(), a.getCreatedAt());
    }
    public record RescheduleSummary(LocalDate requestedDate, LocalTime requestedTime) {}
}
