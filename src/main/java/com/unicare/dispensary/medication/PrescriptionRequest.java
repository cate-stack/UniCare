package com.unicare.dispensary.medication;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
public record PrescriptionRequest(@NotNull Long studentId,@NotBlank @Size(max=120) String name,@NotBlank @Size(max=200) String dose,@NotBlank @Size(max=120) String frequency,@NotNull LocalDate startDate,@NotNull LocalDate endDate,@Size(max=60) String quantity,@Size(max=500) String notes){}
