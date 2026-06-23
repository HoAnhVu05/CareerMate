package vn.careermate.userservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.careermate.userservice.model.OAuthAccount;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface OAuthAccountRepository extends JpaRepository<OAuthAccount, UUID> {
    Optional<OAuthAccount> findByProviderAndProviderId(String provider, String providerId);
    Optional<OAuthAccount> findByUserIdAndProvider(UUID userId, String provider);
}
