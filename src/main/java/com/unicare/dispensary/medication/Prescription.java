package com.unicare.dispensary.medication;

import com.unicare.dispensary.student.Student;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity @Table(name="prescriptions", indexes=@Index(name="idx_prescription_student",columnList="student_id"))
public class Prescription {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="student_id",nullable=false) private Student student;
    @Column(nullable=false,length=120) private String name;
    @Column(nullable=false,length=200) private String dose;
    @Column(nullable=false,length=120) private String frequency;
    @Column(nullable=false) private LocalDate startDate;
    @Column(nullable=false) private LocalDate endDate;
    @Column(length=60) private String quantity;
    @Column(length=500) private String notes;
    @Column(nullable=false,length=120) private String prescribedBy;
    @Enumerated(EnumType.STRING) @Column(nullable=false,length=20) private PrescriptionStatus status=PrescriptionStatus.ACTIVE;
    @Column(nullable=false) private LocalDateTime createdAt;
    protected Prescription(){}
    public Prescription(Student student,String name,String dose,String frequency,LocalDate startDate,LocalDate endDate,String quantity,String notes,String prescribedBy){this.student=student;this.name=name;this.dose=dose;this.frequency=frequency;this.startDate=startDate;this.endDate=endDate;this.quantity=quantity;this.notes=notes;this.prescribedBy=prescribedBy;}
    @PrePersist void onCreate(){createdAt=LocalDateTime.now();}
    public Long getId(){return id;} public Student getStudent(){return student;} public String getName(){return name;} public String getDose(){return dose;} public String getFrequency(){return frequency;} public LocalDate getStartDate(){return startDate;} public LocalDate getEndDate(){return endDate;} public String getQuantity(){return quantity;} public String getNotes(){return notes;} public String getPrescribedBy(){return prescribedBy;} public PrescriptionStatus getStatus(){return status;} public LocalDateTime getCreatedAt(){return createdAt;} public void setStatus(PrescriptionStatus status){this.status=status;}
}
