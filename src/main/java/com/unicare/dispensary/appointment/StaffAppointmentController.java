package com.unicare.dispensary.appointment;

import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/staff/appointments")
public class StaffAppointmentController {
    private final AppointmentService service;
    public StaffAppointmentController(AppointmentService service){this.service=service;}
    @GetMapping public List<AppointmentResponse> list(){return service.allForStaff();}
    @PatchMapping("/{id}")
    public AppointmentResponse update(@PathVariable Long id,@Valid @RequestBody StaffAppointmentUpdate request,Principal principal){return service.updateForStaff(id,request,principal.getName());}
    @PostMapping("/{id}/reschedule/{decision}")
    public AppointmentResponse decide(@PathVariable Long id,@PathVariable String decision,Principal principal){
        if(!decision.equals("approve")&&!decision.equals("decline")) throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST,"Decision must be approve or decline.");
        return service.decideReschedule(id,decision.equals("approve"),principal.getName());
    }
}
