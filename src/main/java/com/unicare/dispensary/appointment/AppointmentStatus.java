package com.unicare.dispensary.appointment;

public enum AppointmentStatus {
    PENDING, CONFIRMED, RESCHEDULE_REQUESTED, RESCHEDULE_DECLINED, COMPLETED, CANCELLED;

    @com.fasterxml.jackson.annotation.JsonValue
    public String toJson() {
        return switch (this) {
            case RESCHEDULE_REQUESTED -> "Reschedule Requested";
            case RESCHEDULE_DECLINED -> "Reschedule Declined";
            default -> name().charAt(0) + name().substring(1).toLowerCase(java.util.Locale.ROOT);
        };
    }

    @com.fasterxml.jackson.annotation.JsonCreator
    public static AppointmentStatus fromJson(String value) {
        return valueOf(value.trim().replace(' ', '_').toUpperCase(java.util.Locale.ROOT));
    }
}
