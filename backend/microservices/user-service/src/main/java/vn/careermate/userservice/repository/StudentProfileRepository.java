package vn.careermate.userservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.careermate.userservice.model.StudentProfile;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface StudentProfileRepository extends JpaRepository<StudentProfile, UUID> {
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"user"})
    java.util.Optional<StudentProfile> findWithUserById(UUID id);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"user"})
    java.util.Optional<StudentProfile> findWithUserByUserId(UUID userId);

    java.util.Optional<StudentProfile> findByUserId(UUID userId);
}
