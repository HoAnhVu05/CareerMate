package vn.careermate.userservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.careermate.userservice.model.StudentSkill;

import java.util.List;
import java.util.UUID;

@Repository
public interface StudentSkillRepository extends JpaRepository<StudentSkill, UUID> {
    List<StudentSkill> findByStudentId(UUID studentId);
}
