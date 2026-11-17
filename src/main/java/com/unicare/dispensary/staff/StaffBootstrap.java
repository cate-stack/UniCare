package com.unicare.dispensary.staff;

import java.util.Locale;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.unicare.dispensary.student.StudentRepository;

@Configuration
public class StaffBootstrap {
    @Bean
    CommandLineRunner createInitialStaff(StaffRepository repository, StudentRepository students, PasswordEncoder encoder) {
        return args -> {
            String email = System.getenv("UNICARE_STAFF_EMAIL");
            String password = System.getenv("UNICARE_STAFF_PASSWORD");
            String name = System.getenv().getOrDefault("UNICARE_STAFF_NAME", "Dispensary Staff");
            if (email == null || email.isBlank() || password == null || password.length() < 12) {
                return;
            }
            String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);
            if (students.existsByEmailIgnoreCase(normalizedEmail)) {
                throw new IllegalStateException("Initial staff email already belongs to a student account.");
            }
            if (!repository.existsByEmailIgnoreCase(normalizedEmail)) {
                repository.save(new StaffAccount(name.trim(), normalizedEmail, encoder.encode(password)));
            }
        };
    }
}
