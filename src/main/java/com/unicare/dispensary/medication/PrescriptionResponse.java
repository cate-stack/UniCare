package com.unicare.dispensary.medication;
import java.time.LocalDate;
import java.time.LocalDateTime;
public record PrescriptionResponse(Long id,Long studentId,String studentName,String name,String dose,String frequency,LocalDate startDate,LocalDate endDate,String quantity,String notes,String prescribedBy,PrescriptionStatus status,LocalDateTime createdAt){static PrescriptionResponse from(Prescription p){return new PrescriptionResponse(p.getId(),p.getStudent().getId(),p.getStudent().getFullName(),p.getName(),p.getDose(),p.getFrequency(),p.getStartDate(),p.getEndDate(),p.getQuantity(),p.getNotes(),p.getPrescribedBy(),p.getStatus(),p.getCreatedAt());}}
