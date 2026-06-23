package vn.careermate.jobservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.careermate.jobservice.model.JobSkill;

import java.util.List;
import java.util.UUID;

@Repository
public interface JobSkillRepository extends JpaRepository<JobSkill, UUID> {
    List<JobSkill> findByJobId(UUID jobId);
    
    @org.springframework.data.jpa.repository.Query("SELECT js.skillName, COUNT(DISTINCT js.job.id) as jobCount " +
           "FROM JobSkill js GROUP BY js.skillName ORDER BY jobCount DESC")
    List<Object[]> findTopSkillsByJobCount();
    
    void deleteByJobId(UUID jobId);
}
