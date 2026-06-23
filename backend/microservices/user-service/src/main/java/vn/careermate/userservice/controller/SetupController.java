package vn.careermate.userservice.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import vn.careermate.userservice.model.User;
import vn.careermate.userservice.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Temporary controller to create admin user
 * Remove this in production!
 */
@Slf4j
@RestController
@RequestMapping("/api/setup")
@RequiredArgsConstructor
public class SetupController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/create-admin")
    public ResponseEntity<Map<String, Object>> createAdminUser() {
        Map<String, Object> response = new HashMap<>();
        
        String adminEmail = "admin@careermate.vn";
        String adminPassword = "admin123";
        
        try {
            // Check if admin already exists
            var existingAdmin = userRepository.findByEmail(adminEmail);
            
            if (existingAdmin.isPresent()) {
                User admin = existingAdmin.get();
                
                // Update to ADMIN role if not already
                if (admin.getRole() != User.UserRole.ADMIN) {
                    admin.setRole(User.UserRole.ADMIN);
                    admin.setStatus(User.UserStatus.ACTIVE);
                    admin.setUpdatedAt(LocalDateTime.now());
                    userRepository.save(admin);
                    
                    response.put("status", "updated");
                    response.put("message", "Existing user updated to ADMIN role");
                } else {
                    response.put("status", "exists");
                    response.put("message", "Admin user already exists with ADMIN role");
                }
                
                response.put("email", admin.getEmail());
                response.put("role", admin.getRole().name());
                
            } else {
                // Create new admin user
                User newAdmin = User.builder()
                        .email(adminEmail)
                        .passwordHash(passwordEncoder.encode(adminPassword))
                        .fullName("System Administrator")
                        .phone("0900000000")
                        .role(User.UserRole.ADMIN)
                        .status(User.UserStatus.ACTIVE)
                        .emailVerified(true)
                        .build();
                
                userRepository.save(newAdmin);
                
                response.put("status", "created");
                response.put("message", "Admin user created successfully");
                response.put("email", adminEmail);
                response.put("password", adminPassword);
                response.put("role", "ADMIN");
            }
            
            log.info("Admin user setup completed: {}", response.get("status"));
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error creating admin user", e);
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
    
    @GetMapping("/check-admin")
    public ResponseEntity<Map<String, Object>> checkAdminUser() {
        Map<String, Object> response = new HashMap<>();
        
        var admin = userRepository.findByEmail("admin@careermate.vn");
        
        if (admin.isPresent()) {
            User user = admin.get();
            response.put("exists", true);
            response.put("email", user.getEmail());
            response.put("fullName", user.getFullName());
            response.put("role", user.getRole().name());
            response.put("status", user.getStatus().name());
        } else {
            response.put("exists", false);
            response.put("message", "Admin user not found");
        }
        
        return ResponseEntity.ok(response);
    }
}
