package vn.careermate.aiservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.careermate.aiservice.model.CareerRoadmap;
import vn.careermate.aiservice.repository.CareerRoadmapRepository;
import vn.careermate.aiservice.service.AIService;
import vn.careermate.common.client.UserServiceClient;
import vn.careermate.common.dto.StudentProfileDTO;

import java.util.*;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CareerRoadmapService {

    private final CareerRoadmapRepository roadmapRepository;
    private final UserServiceClient userServiceClient;
    private final AIService aiService;

    @Transactional
    public CareerRoadmap generateRoadmap(UUID studentId, String careerGoal, String currentLevel) {
        // Verify student exists via Feign Client
        StudentProfileDTO student;
        try {
            student = userServiceClient.getStudentProfileById(studentId);
            if (student == null) {
                throw new RuntimeException("Student not found");
            }
        } catch (Exception e) {
            log.error("Error fetching student profile: {}", e.getMessage());
            throw new RuntimeException("Student not found");
        }

        // Use AI to generate personalized roadmap
        String studentInfo = buildStudentInfo(student);
        Map<String, Object> roadmapData = aiService.getCareerRoadmap(studentInfo, careerGoal);

        @SuppressWarnings("unchecked")
        List<String> skillsGap = (List<String>) roadmapData.getOrDefault("skillsGap", new ArrayList<>());
        
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> recommendedCourses = (List<Map<String, Object>>) roadmapData.getOrDefault("recommendedCourses", new ArrayList<>());
        
        CareerRoadmap roadmap = CareerRoadmap.builder()
                .studentId(studentId) // Use UUID instead of entity
                .careerGoal(careerGoal)
                .currentLevel(currentLevel)
                .targetLevel("ADVANCED") // Default
                .roadmapData(roadmapData)
                .skillsGap(skillsGap)
                .recommendedCourses(recommendedCourses)
                .estimatedDurationMonths((Integer) roadmapData.getOrDefault("estimatedDurationMonths", 6))
                .progressPercentage(0)
                .build();

        return roadmapRepository.save(roadmap);
    }

    public Optional<CareerRoadmap> getStudentRoadmap(UUID studentId) {
        return roadmapRepository.findByStudentId(studentId);
    }

    @Transactional
    public CareerRoadmap updateProgress(UUID roadmapId, Integer progressPercentage) {
        CareerRoadmap roadmap = roadmapRepository.findById(roadmapId)
                .orElseThrow(() -> new RuntimeException("Roadmap not found"));

        roadmap.setProgressPercentage(progressPercentage);
        return roadmapRepository.save(roadmap);
    }

    private String buildStudentInfo(StudentProfileDTO student) {
        StringBuilder info = new StringBuilder();
        info.append("=== THÔNG TIN SINH VIÊN ===\n");
        info.append("Trường đại học: ").append(student.getUniversity() != null ? student.getUniversity() : "Chưa cập nhật").append("\n");
        info.append("Chuyên ngành: ").append(student.getMajor() != null ? student.getMajor() : "Chưa cập nhật").append("\n");
        info.append("Năm tốt nghiệp: ").append(student.getGraduationYear() != null ? student.getGraduationYear() : "Chưa xác định").append("\n");
        info.append("GPA: ").append(student.getGpa() != null ? student.getGpa() : "Chưa cập nhật").append("\n");
        info.append("Trạng thái hiện tại: ").append(student.getCurrentStatus() != null ? student.getCurrentStatus() : "STUDENT").append("\n");
        
        if (student.getBio() != null && !student.getBio().trim().isEmpty()) {
            info.append("Giới thiệu: ").append(student.getBio()).append("\n");
        }
        
        // Note: Skills and CVs would need to be fetched via UserServiceClient if needed
        // For now, we'll skip them or add TODO comments
        // TODO: Add methods to UserServiceClient to fetch student skills and CVs if needed
        
        return info.toString();
    }
}
