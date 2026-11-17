package com.unicare.dispensary.student;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.bind.annotation.*;

import java.util.Locale;
import java.util.Map;
import com.unicare.dispensary.staff.StaffAccount;
import com.unicare.dispensary.staff.StaffRepository;

@RestController
@RequestMapping({"/api/students", "/api/auth"})
public class StudentAuthController {

    private final AuthenticationManager authenticationManager;
    private final StudentRepository studentRepository;
    private final StaffRepository staffRepository;
    private final SecurityContextRepository securityContextRepository;

    public StudentAuthController(
            AuthenticationManager authenticationManager,
            StudentRepository studentRepository,
            StaffRepository staffRepository,
            SecurityContextRepository securityContextRepository
    ) {
        this.authenticationManager = authenticationManager;
        this.studentRepository = studentRepository;
        this.staffRepository = staffRepository;
        this.securityContextRepository = securityContextRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse
    ) {

        try {
            String email = request.email()
                    .trim()
                    .toLowerCase(Locale.ROOT);

            Authentication authentication =
                    authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(
                            email,
                            request.password()
                        )
                    );

            boolean isStaff = authentication.getAuthorities().contains(
                new SimpleGrantedAuthority("ROLE_STAFF")
            );

            SecurityContext context =
                    SecurityContextHolder.createEmptyContext();

            context.setAuthentication(authentication);

            SecurityContextHolder.setContext(context);

            securityContextRepository.saveContext(
                context,
                httpRequest,
                httpResponse
            );

            if (isStaff) {
                StaffAccount staff = staffRepository
                    .findByEmailIgnoreCase(authentication.getName()).orElseThrow();
                return ResponseEntity.ok(Map.of(
                    "message", "Login successful.",
                    "id", staff.getId(),
                    "fullName", staff.getFullName(),
                    "email", staff.getEmail(),
                    "role", "staff"
                ));
            }

            Student student = studentRepository
                    .findByEmailIgnoreCase(authentication.getName())
                    .orElseThrow();
            return ResponseEntity.ok(
                Map.of(
                    "message", "Login successful.",
                    "id", student.getId(),
                    "fullName", student.getFullName(),
                    "email", student.getEmail(),
                    "studentNumber", student.getStudentNumber(),
                    "phone", student.getPhone(),
                    "course", student.getCourse(),
                    "yearOfStudy", student.getYearOfStudy(),
                    "role", "student"
                )
            );

        } catch (AuthenticationException exception) {

            SecurityContextHolder.clearContext();

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                        "message", "Invalid email or password."
                    ));
        }
    }
}
