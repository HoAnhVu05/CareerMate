package vn.careermate.aiservice.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import vn.careermate.aiservice.model.CareerRoadmap;
import vn.careermate.aiservice.service.CareerRoadmapService;
import vn.careermate.common.client.UserServiceClient;
import vn.careermate.common.dto.StudentProfileDTO;
import vn.careermate.common.dto.UserDTO;

import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/ai/career-roadmap")
@RequiredArgsConstructor
@PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN')")
public class CareerRoadmapController {

    private final CareerRoadmapService roadmapService;
    private final UserServiceClient userServiceClient;

    @PostMapping("/generate")
    public ResponseEntity<CareerRoadmap> generateRoadmap(
            @RequestParam String careerGoal,
            @RequestParam(required = false, defaultValue = "BEGINNER") String currentLevel
    ) {
        UUID studentId = getCurrentStudentId();
        return ResponseEntity.ok(roadmapService.generateRoadmap(studentId, careerGoal, currentLevel));
    }

    @GetMapping
    public ResponseEntity<CareerRoadmap> getMyRoadmap() {
        UUID studentId = getCurrentStudentId();
        Optional<CareerRoadmap> roadmap = roadmapService.getStudentRoadmap(studentId);
        return roadmap.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{roadmapId}/progress")
    public ResponseEntity<CareerRoadmap> updateProgress(
            @PathVariable UUID roadmapId,
            @RequestParam Integer progressPercentage
    ) {
        return ResponseEntity.ok(roadmapService.updateProgress(roadmapId, progressPercentage));
    }

    private UUID getCurrentStudentId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        
        try {
            UserDTO user = userServiceClient.getUserByEmail(email);
            if (user == null) {
                throw new RuntimeException("User not found");
            }
            
            StudentProfileDTO studentProfile = userServiceClient.getStudentProfileByUserId(user.getId());
            if (studentProfile == null) {
                throw new RuntimeException("Student profile not found");
            }
            
            return studentProfile.getId();
        } catch (Exception e) {
            throw new RuntimeException("Student profile not found");
        }
    }
}
