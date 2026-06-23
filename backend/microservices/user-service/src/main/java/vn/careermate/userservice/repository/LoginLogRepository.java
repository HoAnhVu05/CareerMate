package vn.careermate.userservice.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.careermate.userservice.model.LoginLog;

import java.util.UUID;

@Repository
public interface LoginLogRepository extends JpaRepository<LoginLog, UUID> {
    Page<LoginLog> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);
    long countByEmailAndStatusAndCreatedAtAfter(String email, String status, java.time.LocalDateTime after);
}
