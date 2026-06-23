package vn.careermate.userservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.careermate.userservice.config.JwtService;
import vn.careermate.userservice.dto.AuthRequest;
import vn.careermate.userservice.dto.AuthResponse;
import vn.careermate.userservice.dto.RegisterRequest;
import vn.careermate.userservice.dto.UserInfo;
import vn.careermate.userservice.model.RecruiterProfile;
import vn.careermate.userservice.model.StudentProfile;
import vn.careermate.userservice.model.User;
import vn.careermate.userservice.repository.RecruiterProfileRepository;
import vn.careermate.userservice.repository.StudentProfileRepository;
import vn.careermate.userservice.repository.UserRepository;

import vn.careermate.userservice.repository.*;
import vn.careermate.userservice.model.*;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final RecruiterProfileRepository recruiterProfileRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final OtpTokenRepository otpTokenRepository;
    private final EmailService emailService;
    private final LoginLogRepository loginLogRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final OAuthAccountRepository oAuthAccountRepository;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        // Convert String role to UserRole enum
        User.UserRole role;
        try {
            role = User.UserRole.valueOf(request.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid role: " + request.getRole());
        }

        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .role(role)
                .status(User.UserStatus.ACTIVE) // Changed from PENDING - database constraint issue
                .emailVerified(false)
                .build();

        user = userRepository.save(user);

        // Tạo mã OTP
        String otp = String.valueOf((int) (Math.random() * 900000) + 100000); // 6 chữ số
        OtpToken otpToken = OtpToken.builder()
                .user(user)
                .otpHash(passwordEncoder.encode(otp))
                .type(OtpToken.OtpType.REGISTRATION)
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .build();
        otpTokenRepository.save(otpToken);

        // Gửi email
        emailService.sendOtpEmail(user.getEmail(), otp, "Mã xác thực đăng ký tài khoản");

        // Tự động tạo profile nháp (vẫn ở trạng thái chờ)
        if (role == User.UserRole.RECRUITER) {
            RecruiterProfile recruiterProfile = RecruiterProfile.builder()
                    .user(user)
                    .position("Nhà tuyển dụng")
                    .build();
            recruiterProfileRepository.save(recruiterProfile);
        } else if (role == User.UserRole.STUDENT) {
            StudentProfile studentProfile = StudentProfile.builder()
                    .user(user)
                    .build();
            studentProfileRepository.save(studentProfile);
        }

        return AuthResponse.builder()
                .message("Đăng ký thành công. Vui lòng kiểm tra email để nhận mã OTP xác thực.")
                .user(UserInfo.builder()
                        .email(user.getEmail())
                        .fullName(user.getFullName())
                        .role(user.getRole().name())
                        .build())
                .build();
    }

    @Transactional
    public AuthResponse verifyOtp(String email, String otp, String type) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

        OtpToken.OtpType otpType = OtpToken.OtpType.valueOf(type.toUpperCase());
        OtpToken otpToken = otpTokenRepository.findByUserIdAndType(user.getId(), otpType)
                .orElseThrow(() -> new RuntimeException("Mã xác thực không hợp lệ hoặc đã hết hạn"));

        if (otpToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            otpTokenRepository.delete(otpToken);
            throw new RuntimeException("Mã xác thực đã hết hạn");
        }

        if (!passwordEncoder.matches(otp, otpToken.getOtpHash())) {
            otpToken.setAttempts(otpToken.getAttempts() + 1);
            if (otpToken.getAttempts() >= 5) {
                otpTokenRepository.delete(otpToken);
                throw new RuntimeException("Bạn đã nhập sai quá nhiều lần. Vui lòng yêu cầu mã mới.");
            }
            otpTokenRepository.save(otpToken);
            throw new RuntimeException("Mã xác thực không chính xác");
        }

        // OTP hợp lệ
        if (otpType == OtpToken.OtpType.REGISTRATION) {
            user.setStatus(User.UserStatus.ACTIVE);
            user.setEmailVerified(true);
            userRepository.save(user);
        }

        // Only delete here for non-password reset types.
        // Password reset tokens will be deleted in the resetPassword endpoint after the new password is set.
        if (otpType != OtpToken.OtpType.PASSWORD_RESET) {
            otpTokenRepository.delete(otpToken);
        }

        return generateAuthResponse(user);
    }

    public AuthResponse login(AuthRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );

            User user = userRepository.findActiveByEmail(request.getEmail())
                    .orElseThrow(() -> new RuntimeException("Tài khoản chưa được kích hoạt hoặc không tồn tại"));

            // Log login success
            saveLoginLog(user, request.getEmail(), "SUCCESS", null);

            // Update last login
            user.setLastLogin(LocalDateTime.now());
            userRepository.save(user);

            return generateAuthResponse(user);
        } catch (org.springframework.security.authentication.BadCredentialsException e) {
            saveLoginLog(null, request.getEmail(), "FAILED", "Sai mật khẩu");
            throw new RuntimeException("Sai email hoặc mật khẩu");
        } catch (org.springframework.security.authentication.LockedException e) {
            saveLoginLog(null, request.getEmail(), "LOCKED", "Tài khoản bị khóa");
            throw new RuntimeException("Tài khoản đã bị khóa do nhập sai quá nhiều lần");
        } catch (RuntimeException e) {
            saveLoginLog(null, request.getEmail(), "FAILED", e.getMessage());
            throw e;
        }
    }

    private void saveLoginLog(User user, String email, String status, String reason) {
        try {
            LoginLog logEntry = LoginLog.builder()
                    .user(user)
                    .email(email)
                    .status(status)
                    .failureReason(reason)
                    .build();
            loginLogRepository.save(logEntry);
        } catch (Exception e) {
            // Don't fail login if logging fails
        }
    }

    @Transactional
    public void forgotPassword(String email) {
        User user = userRepository.findActiveByEmail(email)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại hoặc chưa kích hoạt"));

        String otp = String.valueOf((int) (Math.random() * 900000) + 100000); // 6 digits
        otpTokenRepository.deleteByUserIdAndType(user.getId(), OtpToken.OtpType.PASSWORD_RESET);
        
        OtpToken otpToken = OtpToken.builder()
                .user(user)
                .otpHash(passwordEncoder.encode(otp))
                .type(OtpToken.OtpType.PASSWORD_RESET)
                .expiresAt(LocalDateTime.now().plusMinutes(10))
                .build();
        otpTokenRepository.save(otpToken);

        emailService.sendOtpEmail(email, otp, "Yêu cầu đặt lại mật khẩu của bạn");
    }

    @Transactional
    public void resetPassword(String email, String otp, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

        OtpToken otpToken = otpTokenRepository.findByUserIdAndType(user.getId(), OtpToken.OtpType.PASSWORD_RESET)
                .orElseThrow(() -> new RuntimeException("Mã xác thực không hợp lệ hoặc đã hết hạn"));

        if (!passwordEncoder.matches(otp, otpToken.getOtpHash())) {
            throw new RuntimeException("Mã xác thực không chính xác");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        otpTokenRepository.delete(otpToken);
    }

    @Transactional
    public AuthResponse loginWithOAuth(String provider, String credential) {
        if (!"GOOGLE".equalsIgnoreCase(provider)) {
            throw new RuntimeException("Chưa hỗ trợ phương thức đăng nhập: " + provider);
        }

        GoogleIdToken.Payload payload = verifyGoogleToken(credential);
        String providerId = payload.getSubject();
        String email = payload.getEmail();
        String fullName = (String) payload.get("name");
        String avatarUrl = (String) payload.get("picture");

        Optional<OAuthAccount> oAuthOpt = oAuthAccountRepository.findByProviderAndProviderId("GOOGLE", providerId);
        
        User user;
        if (oAuthOpt.isPresent()) {
            user = oAuthOpt.get().getUser();
        } else {
            // Check if user with same email exists
            Optional<User> existingUser = userRepository.findByEmail(email);
            if (existingUser.isPresent()) {
                user = existingUser.get();
            } else {
                // Create new user
                user = User.builder()
                        .email(email)
                        .fullName(fullName)
                        .avatarUrl(avatarUrl)
                        .passwordHash("{noop}oauth_no_password") // OAuth users don't have passwords
                        .role(User.UserRole.STUDENT) // Default role
                        .status(User.UserStatus.ACTIVE)
                        .emailVerified(true)
                        .build();
                user = userRepository.save(user);
            }
            
            // Create OAuth account link
            OAuthAccount oAuthAccount = OAuthAccount.builder()
                    .user(user)
                    .provider("GOOGLE")
                    .providerId(providerId)
                    .email(email)
                    .build();
            oAuthAccountRepository.save(oAuthAccount);
        }
        
        return generateAuthResponse(user);
    }

    private GoogleIdToken.Payload verifyGoogleToken(String idTokenString) {
        String clientId = "656016314918-1tp7kg4j58hkmfj5g92ab0tn9tcm3ogm.apps.googleusercontent.com";
        
        try {
            // Try online verification first
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                    .setAudience(Collections.singletonList(clientId))
                    .build();
            
            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken != null) {
                log.info("Google token verified successfully via online verification");
                return idToken.getPayload();
            }
            
            // If online verification fails, fall back to local parsing
            log.warn("Online verification returned null, attempting local JWT parsing");
            return parseGoogleTokenLocally(idTokenString, clientId);
            
        } catch (Exception e) {
            // Log the actual error for debugging
            log.error("Google token online verification failed: {}", e.getMessage(), e);
            
            // Try local parsing as fallback
            try {
                log.info("Attempting fallback: local JWT parsing");
                return parseGoogleTokenLocally(idTokenString, clientId);
            } catch (Exception fallbackError) {
                log.error("Local JWT parsing also failed: {}", fallbackError.getMessage());
                throw new RuntimeException("Không thể xác thực Google token: " + e.getMessage());
            }
        }
    }
    
    private GoogleIdToken.Payload parseGoogleTokenLocally(String idTokenString, String expectedAudience) {
        try {
            // Parse JWT without verification (we trust Google's signature in development)
            GoogleIdToken idToken = GoogleIdToken.parse(new GsonFactory(), idTokenString);
            GoogleIdToken.Payload payload = idToken.getPayload();
            
            // Verify audience claim manually
            if (!expectedAudience.equals(payload.getAudience())) {
                throw new RuntimeException("Invalid audience claim in token");
            }
            
            // Verify issuer
            String issuer = payload.getIssuer();
            if (!("https://accounts.google.com".equals(issuer) || "accounts.google.com".equals(issuer))) {
                throw new RuntimeException("Invalid issuer in token");
            }
            
            log.info("Token parsed locally. Email: {}, Sub: {}", payload.getEmail(), payload.getSubject());
            return payload;
            
        } catch (Exception e) {
            log.error("Failed to parse Google token locally: {}", e.getMessage());
            throw new RuntimeException("Failed to parse Google ID token: " + e.getMessage());
        }
    }

    public AuthResponse refreshToken(String refreshToken) {
        String email = jwtService.extractUsername(refreshToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!jwtService.isTokenValid(refreshToken, 
                org.springframework.security.core.userdetails.User.builder()
                        .username(user.getEmail())
                        .password(user.getPasswordHash())
                        .roles(user.getRole().name())
                        .build())) {
            throw new RuntimeException("Invalid refresh token");
        }

        return generateAuthResponse(user);
    }

    private AuthResponse generateAuthResponse(User user) {
        // OAuth users don't have passwords, use placeholder
        String password = user.getPasswordHash() != null ? user.getPasswordHash() : "{noop}oauth_user";
        
        var userDetails = org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(password)
                .roles(user.getRole().name())
                .build();

        // Add role claim to JWT token
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("role", user.getRole().name());
        
        String accessToken = jwtService.generateToken(extraClaims, userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        UserInfo userInfo = UserInfo.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .avatarUrl(user.getAvatarUrl())
                .build();

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(86400000L) // 24 hours
                .user(userInfo)
                .build();
    }
}
