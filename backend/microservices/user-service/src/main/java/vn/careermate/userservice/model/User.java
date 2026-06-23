package vn.careermate.userservice.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import vn.careermate.userservice.model.OAuthAccount;
import vn.careermate.userservice.model.StudentProfile;
import vn.careermate.userservice.model.RecruiterProfile;
import vn.careermate.userservice.model.OtpToken;
import vn.careermate.userservice.model.PasswordResetToken;
import vn.careermate.userservice.model.LoginLog;
import vn.careermate.userservice.model.Message;
import vn.careermate.userservice.model.Conversation;

@Entity
@Table(name = "users", schema = "userservice", indexes = {
    @Index(name = "idx_users_email", columnList = "email"),
    @Index(name = "idx_users_role", columnList = "role"),
    @Index(name = "idx_users_status", columnList = "status")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@EntityListeners(AuditingEntityListener.class)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(name = "password_hash", nullable = false)
    @JsonIgnore
    private String passwordHash;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    private String phone;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private UserStatus status = UserStatus.ACTIVE;

    @Column(name = "email_verified")
    @Builder.Default
    private Boolean emailVerified = false;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "last_login")
    private LocalDateTime lastLogin;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<OAuthAccount> oauthAccounts;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private StudentProfile studentProfile;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private RecruiterProfile recruiterProfile;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<OtpToken> otpTokens;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<PasswordResetToken> passwordResetTokens;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<LoginLog> loginLogs;

    @OneToMany(mappedBy = "participant1", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Conversation> conversationsAsParticipant1;

    @OneToMany(mappedBy = "participant2", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Conversation> conversationsAsParticipant2;

    @OneToMany(mappedBy = "sender", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Message> sentMessages;

    public enum UserRole {
        STUDENT, RECRUITER, ADMIN, MENTOR
    }

    public enum UserStatus {
        ACTIVE, PENDING, INACTIVE, SUSPENDED, DELETED
    }
}
