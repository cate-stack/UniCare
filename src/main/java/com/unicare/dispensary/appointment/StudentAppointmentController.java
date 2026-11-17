package com.unicare.dispensary.appointment;

import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/appointments")
public class StudentAppointmentController {
    private final AppointmentService service;
    public StudentAppointmentController(AppointmentService service){this.service=service;}
    @GetMapping("/my") public List<AppointmentResponse> list(Principal principal){return service.forStudent(principal.getName());}
    @PostMapping @ResponseStatus(HttpStatus.CREATED)
    public AppointmentResponse book(@Valid @RequestBody AppointmentRequest request, Principal principal){return service.book(principal.getName(),request);}
    @PatchMapping("/{id}/cancel") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void cancel(@PathVariable Long id, Principal principal){service.cancelStudent(principal.getName(),id);}
    @PatchMapping("/{id}/reschedule")
    public AppointmentResponse reschedule(@PathVariable Long id,@Valid @RequestBody RescheduleRequest request,Principal principal){return service.requestReschedule(principal.getName(),id,request);}
}
