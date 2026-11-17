package com.unicare.dispensary.medication;
import java.security.Principal;import java.util.List;import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/medications") public class StudentPrescriptionController{private final PrescriptionService service;public StudentPrescriptionController(PrescriptionService s){service=s;}@GetMapping("/my") public List<PrescriptionResponse> list(Principal p){return service.forStudent(p.getName());}}
