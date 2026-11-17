package com.unicare.dispensary.student;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping({"/api/students", "/api/auth"})
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> registerStudent(
        @Valid @RequestBody StudentRegistrationRequest request
    ) {

        studentService.register(request);

        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(Map.of(
                "message",
                "Student account created successfully."
            ));
    }
}
