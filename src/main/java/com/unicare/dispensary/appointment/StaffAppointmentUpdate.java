package com.unicare.dispensary.appointment;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record StaffAppointmentUpdate(@NotNull AppointmentStatus status, @Size(max=500) String staffNotes) {}
