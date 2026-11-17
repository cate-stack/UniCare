package com.unicare.dispensary.medication;
public enum PrescriptionStatus { ACTIVE, COMPLETED, DISCONTINUED;
    @com.fasterxml.jackson.annotation.JsonValue public String json(){return name().charAt(0)+name().substring(1).toLowerCase(java.util.Locale.ROOT);}
    @com.fasterxml.jackson.annotation.JsonCreator public static PrescriptionStatus parse(String value){return valueOf(value.trim().toUpperCase(java.util.Locale.ROOT));}
}
