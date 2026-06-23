package vn.careermate.userservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.careermate.userservice.model.OtpToken;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface OtpTokenRepository extends JpaRepository<OtpToken, UUID> {
    Optional<OtpToken> findByUserIdAndType(UUID userId, OtpToken.OtpType type);
    void deleteByUserIdAndType(UUID userId, OtpToken.OtpType type);
    void deleteByUserId(UUID userId);
}
