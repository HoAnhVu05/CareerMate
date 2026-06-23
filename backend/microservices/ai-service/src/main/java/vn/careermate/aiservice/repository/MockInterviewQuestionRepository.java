package vn.careermate.aiservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.careermate.aiservice.model.MockInterviewQuestion;

import java.util.List;
import java.util.UUID;

@Repository
public interface MockInterviewQuestionRepository extends JpaRepository<MockInterviewQuestion, UUID> {
    
    List<MockInterviewQuestion> findByMockInterviewIdOrderByQuestionOrderAsc(UUID mockInterviewId);
    
    @Query("SELECT q FROM MockInterviewQuestion q WHERE q.mockInterview.id = :mockInterviewId ORDER BY q.questionOrder ASC")
    List<MockInterviewQuestion> findAllByMockInterviewId(@Param("mockInterviewId") UUID mockInterviewId);
    
    long countByMockInterviewId(UUID mockInterviewId);
    
    void deleteByMockInterviewId(UUID mockInterviewId);
}
