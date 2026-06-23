package vn.careermate.learningservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.careermate.learningservice.model.ChallengeParticipation;

import java.util.List;
import java.util.UUID;

@Repository
public interface ChallengeParticipationRepository extends JpaRepository<ChallengeParticipation, UUID> {
    List<ChallengeParticipation> findByStudentId(UUID studentId);
    List<ChallengeParticipation> findByChallengeId(UUID challengeId);
    
    @Query("SELECT p FROM ChallengeParticipation p LEFT JOIN FETCH p.challenge WHERE p.studentId = :studentId")
    List<ChallengeParticipation> findByStudentIdWithChallenge(@Param("studentId") UUID studentId);
}
