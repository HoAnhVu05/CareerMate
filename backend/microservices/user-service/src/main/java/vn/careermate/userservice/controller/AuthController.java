package vn.careermate.userservice.controller;

import jakarta.validation.Valid;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.careermate.userservice.dto.AuthRequest;
import vn.careermate.userservice.dto.AuthResponse;
import vn.careermate.userservice.dto.RegisterRequest;
import vn.careermate.userservice.service.AuthService;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshToken(@RequestBody RefreshTokenRequest request) {
        return ResponseEntity.ok(authService.refreshToken(request.getRefreshToken()));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<AuthResponse> verifyOtp(@RequestParam String email, @RequestParam String otp, @RequestParam String type) {
        return ResponseEntity.ok(authService.verifyOtp(email, otp, type));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Void> forgotPassword(@RequestParam String email) {
        authService.forgotPassword(email);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request.getEmail(), request.getOtp(), request.getNewPassword());
        return ResponseEntity.ok().build();
    }

    @Data
    public static class ResetPasswordRequest {
        @jakarta.validation.constraints.Email
        private String email;
        private String otp;
        private String newPassword;
    }

    @PostMapping("/oauth-login")
    public ResponseEntity<AuthResponse> oauthLogin(@RequestBody OAuthLoginRequest request) {
        return ResponseEntity.ok(authService.loginWithOAuth(
                request.getProvider(),
                request.getCredential()
        ));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        // In a stateless JWT system, logout is typically handled client-side
        // by removing the token. For token blacklisting, you'd need Redis.
        return ResponseEntity.ok().build();
    }

    // Inner class for refresh token request
    public static class RefreshTokenRequest {
        private String refreshToken;

        public String getRefreshToken() {
            return refreshToken;
        }

        public void setRefreshToken(String refreshToken) {
            this.refreshToken = refreshToken;
        }
    }

    @lombok.Data
    public static class OAuthLoginRequest {
        private String provider;
        private String credential; // The Google ID Token
        private String email;
        private String fullName;
        private String avatarUrl;
    }
}
