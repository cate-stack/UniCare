package com.unicare.dispensary.student;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "students",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = "email"),
        @UniqueConstraint(columnNames = "student_number")
    }
)
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(name = "student_number", nullable = false, length = 30)
    private String studentNumber;

    @Column(nullable = false, length = 120)
    private String email;

    @Column(nullable = false, length = 16)
    private String phone;

    @Column(nullable = false, length = 100)
    private String course;

    @Column(name = "year_of_study", nullable = false, length = 10)
    private String yearOfStudy;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    protected Student() {
    }

    public Student(
        String fullName,
        String studentNumber,
        String email,
        String phone,
        String course,
        String yearOfStudy,
        String passwordHash
    ) {
        this.fullName = fullName;
        this.studentNumber = studentNumber;
        this.email = email;
        this.phone = phone;
        this.course = course;
        this.yearOfStudy = yearOfStudy;
        this.passwordHash = passwordHash;
    }

    @PrePersist
    public void beforeSaving() {
        createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public String getFullName() {
        return fullName;
    }

    public String getStudentNumber() {
        return studentNumber;
    }

    public String getEmail() {
        return email;
    }

    public String getPhone() {
        return phone;
    }

    public String getCourse() {
        return course;
    }

    public String getYearOfStudy() {
        return yearOfStudy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    public String getPasswordHash(){
        return passwordHash;
    }
}