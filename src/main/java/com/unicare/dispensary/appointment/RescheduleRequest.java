package com.unicare.dispensary.appointment;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;

public record RescheduleRequest(@NotNull @FutureOrPresent LocalDate date, @NotNull LocalTime time) {}
