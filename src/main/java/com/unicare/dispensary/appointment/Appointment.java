package com.unicare.dispensary.appointment;

import com.unicare.dispensary.student.Student;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name="appointments", indexes={@Index(name="idx_appointment_student", columnList="student_id"), @Index(name="idx_appointment_slot", columnList="appointment_date,appointment_time,status")})
public class Appointment {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch=FetchType.LAZY, optional=false)
    @JoinColumn(name="student_id", nullable=false)
    private Student student;
    @Column(nullable=false, length=80) private String service;
    @Column(nullable=false, length=50) private String visitType;
    @Column(nullable=false) private LocalDate appointmentDate;
    @Column(nullable=false) private LocalTime appointmentTime;
    @Column(nullable=false, length=1000) private String reason;
    @Column(length=500) private String notes;
    @Enumerated(EnumType.STRING) @Column(nullable=false, length=32)
    private AppointmentStatus status=AppointmentStatus.PENDING;
    private LocalDate requestedDate;
    private LocalTime requestedTime;
    @Column(length=500) private String staffNotes;
    @Column(length=120) private String reviewedBy;
    @Column(nullable=false) private LocalDateTime createdAt;
    @Column(nullable=false) private LocalDateTime updatedAt;

    protected Appointment() {}
    public Appointment(Student student, String service, String visitType, LocalDate date, LocalTime time, String reason, String notes) {
        this.student=student; this.service=service; this.visitType=visitType;
        this.appointmentDate=date; this.appointmentTime=time; this.reason=reason; this.notes=notes;
    }
    @PrePersist void onCreate() { createdAt=LocalDateTime.now(); updatedAt=createdAt; }
    @PreUpdate void onUpdate() { updatedAt=LocalDateTime.now(); }
    public Long getId(){return id;} public Student getStudent(){return student;}
    public String getService(){return service;} public String getVisitType(){return visitType;}
    public LocalDate getAppointmentDate(){return appointmentDate;} public LocalTime getAppointmentTime(){return appointmentTime;}
    public String getReason(){return reason;} public String getNotes(){return notes;}
    public AppointmentStatus getStatus(){return status;} public LocalDate getRequestedDate(){return requestedDate;}
    public LocalTime getRequestedTime(){return requestedTime;} public String getStaffNotes(){return staffNotes;}
    public String getReviewedBy(){return reviewedBy;} public LocalDateTime getCreatedAt(){return createdAt;}
    public void requestReschedule(LocalDate date, LocalTime time){requestedDate=date;requestedTime=time;status=AppointmentStatus.RESCHEDULE_REQUESTED;}
    public void resolveReschedule(boolean approve){if(approve){appointmentDate=requestedDate;appointmentTime=requestedTime;}requestedDate=null;requestedTime=null;status=AppointmentStatus.CONFIRMED;}
    public void setStatus(AppointmentStatus value){status=value;}
    public void setStaffNotes(String value){staffNotes=value;}
    public void setReviewedBy(String value){reviewedBy=value;}
}
