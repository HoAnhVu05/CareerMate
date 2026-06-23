package vn.careermate.userservice.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.careermate.userservice.model.User;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    
    @org.springframework.data.jpa.repository.Query("SELECT u FROM User u WHERE u.email = :email AND u.status = 'ACTIVE'")
    Optional<User> findActiveByEmail(String email);
    
    boolean existsByEmail(String email);
    long countByRole(User.UserRole role);
    Page<User> findByRole(User.UserRole role, Pageable pageable);
    List<User> findByRoleIn(List<User.UserRole> roles);
}
