package com.unicare.dispensary.appointment;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByStudentIdOrderByAppointmentDateDescAppointmentTimeDesc(Long studentId);
    boolean existsByAppointmentDateAndAppointmentTimeAndStatusIn(LocalDate date, LocalTime time, Collection<AppointmentStatus> statuses);
    boolean existsByAppointmentDateAndAppointmentTimeAndStatusInAndIdNot(LocalDate date, LocalTime time, Collection<AppointmentStatus> statuses, Long ignoredId);
}
