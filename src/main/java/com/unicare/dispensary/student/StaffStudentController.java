package com.unicare.dispensary.student;
import java.util.List;import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/staff/students") public class StaffStudentController{private final StudentRepository repository;public StaffStudentController(StudentRepository r){repository=r;}@GetMapping public List<StudentSummary> all(){return repository.findAll().stream().map(StudentSummary::from).toList();}}
