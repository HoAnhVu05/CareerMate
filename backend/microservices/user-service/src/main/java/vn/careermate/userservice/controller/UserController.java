package vn.careermate.userservice.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.careermate.common.dto.UserDTO;
import vn.careermate.userservice.model.User;
import vn.careermate.userservice.repository.UserRepository;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final vn.careermate.userservice.repository.OtpTokenRepository otpTokenRepository;

    @GetMapping("/{userId}")
    @PreAuthorize("permitAll()") // Allow inter-service calls
    public ResponseEntity<UserDTO> getUserById(@PathVariable UUID userId) {
        User user = userRepository.findById(userId)
                .orElse(null);
        
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity.ok(toDTO(user));
    }

    @GetMapping("/email/{email}")
    @PreAuthorize("permitAll()") // Allow inter-service calls
    public ResponseEntity<UserDTO> getUserByEmail(@PathVariable String email) {
        log.info("GET /users/email/{} - Request received", email);
        
        User user = userRepository.findByEmail(email)
                .orElse(null);
        
        if (user == null) {
            log.warn("GET /users/email/{} - User not found", email);
            return ResponseEntity.notFound().build();
        }
        
        log.info("GET /users/email/{} - User found: {} (ID: {})", email, user.getEmail(), user.getId());
        return ResponseEntity.ok(toDTO(user));
    }

    @PostMapping("/by-roles")
    @PreAuthorize("permitAll()") // Allow inter-service calls
    public ResponseEntity<List<UserDTO>> getUsersByRoles(@RequestBody List<String> roles) {
        List<User.UserRole> userRoles = roles.stream()
                .map(role -> {
                    try {
                        return User.UserRole.valueOf(role.toUpperCase());
                    } catch (IllegalArgumentException e) {
                        return null;
                    }
                })
                .filter(role -> role != null)
                .collect(Collectors.toList());
        
        List<User> users = userRepository.findByRoleIn(userRoles);
        List<UserDTO> userDTOs = users.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(userDTOs);
    }

    @PutMapping("/{userId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDTO> updateUserStatus(
            @PathVariable UUID userId,
            @RequestParam String status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        try {
            user.setStatus(User.UserStatus.valueOf(status.toUpperCase()));
            return ResponseEntity.ok(toDTO(userRepository.save(user)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{userId}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ADMIN')")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<Void> deleteUser(@PathVariable UUID userId) {
        if (!userRepository.existsById(userId)) {
            return ResponseEntity.notFound().build();
        }
        userRepository.deleteById(userId);
        return ResponseEntity.noContent().build();
    }

    private UserDTO toDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .role(user.getRole().name())
                .status(user.getStatus().name())
                .emailVerified(user.getEmailVerified())
                .avatarUrl(user.getAvatarUrl())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
