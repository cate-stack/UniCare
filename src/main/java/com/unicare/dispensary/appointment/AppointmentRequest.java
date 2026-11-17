package com.unicare.dispensary.appointment;

import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.time.LocalTime;

public record AppointmentRequest(
    @NotBlank @Size(max=80) String service,
    @NotBlank @Size(max=50) String visitType,
    @NotNull @FutureOrPresent LocalDate date,
    @NotNull LocalTime time,
    @NotBlank @Size(max=1000) String reason,
    @Size(max=500) String notes
) {}
