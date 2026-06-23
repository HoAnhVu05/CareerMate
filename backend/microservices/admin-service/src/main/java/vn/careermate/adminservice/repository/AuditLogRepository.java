package vn.careermate.adminservice.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.careermate.adminservice.model.AuditLog;

import java.util.UUID;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {
    Page<AuditLog> findByAdminIdOrderByCreatedAtDesc(UUID adminId, Pageable pageable);
    Page<AuditLog> findByEntityTypeAndEntityIdOrderByCreatedAtDesc(
            AuditLog.EntityType entityType, UUID entityId, Pageable pageable);
    Page<AuditLog> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
