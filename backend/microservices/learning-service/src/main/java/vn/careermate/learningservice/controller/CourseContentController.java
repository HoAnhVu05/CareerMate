package vn.careermate.learningservice.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.careermate.learningservice.model.CourseModule;
import vn.careermate.learningservice.model.Lesson;
import vn.careermate.learningservice.model.LessonProgress;
import vn.careermate.learningservice.service.CourseContentService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/course-content")
@RequiredArgsConstructor
@Slf4j
public class CourseContentController {

    private final CourseContentService contentService;

    @GetMapping("/courses/{courseId}/modules")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<CourseModule>> getCourseModules(@PathVariable UUID courseId) {
        log.info("GET /course-content/courses/{}/modules", courseId);
        List<CourseModule> modules = contentService.getCourseModulesWithLessons(courseId);
        log.info("GET /course-content/courses/{}/modules - Returning {} modules", courseId, modules.size());
        return ResponseEntity.ok(modules);
    }

    @GetMapping("/modules/{moduleId}/lessons")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<Lesson>> getModuleLessons(@PathVariable UUID moduleId) {
        log.info("GET /course-content/modules/{}/lessons", moduleId);
        List<Lesson> lessons = contentService.getModuleLessons(moduleId);
        log.info("GET /course-content/modules/{}/lessons - Returning {} lessons", moduleId, lessons.size());
        return ResponseEntity.ok(lessons);
    }

    @GetMapping("/lessons/{lessonId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Lesson> getLesson(@PathVariable UUID lessonId) {
        log.info("GET /course-content/lessons/{}", lessonId);
        return ResponseEntity.ok(contentService.getLessonById(lessonId));
    }

    @GetMapping("/enrollments/{enrollmentId}/progress")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<LessonProgress>> getEnrollmentProgress(@PathVariable UUID enrollmentId) {
        log.info("GET /course-content/enrollments/{}/progress", enrollmentId);
        return ResponseEntity.ok(contentService.getEnrollmentProgress(enrollmentId));
    }

    @GetMapping("/enrollments/{enrollmentId}/lessons/{lessonId}/progress")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<LessonProgress> getLessonProgress(
            @PathVariable UUID enrollmentId,
            @PathVariable UUID lessonId
    ) {
        log.info("GET /course-content/enrollments/{}/lessons/{}/progress", enrollmentId, lessonId);
        LessonProgress progress = contentService.getOrCreateLessonProgress(enrollmentId, lessonId);
        return ResponseEntity.ok(progress);
    }

    @PutMapping("/enrollments/{enrollmentId}/lessons/{lessonId}/progress")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<LessonProgress> updateLessonProgress(
            @PathVariable UUID enrollmentId,
            @PathVariable UUID lessonId,
            @RequestBody java.util.Map<String, Object> updates
    ) {
        log.info("PUT /course-content/enrollments/{}/lessons/{}/progress", enrollmentId, lessonId);
        Integer currentTimeSeconds = updates.get("currentTimeSeconds") != null 
            ? ((Number) updates.get("currentTimeSeconds")).intValue() 
            : null;
        Boolean completed = updates.get("completed") != null 
            ? (Boolean) updates.get("completed") 
            : null;
        return ResponseEntity.ok(contentService.updateLessonProgress(enrollmentId, lessonId, currentTimeSeconds, completed));
    }

    @PostMapping("/enrollments/{enrollmentId}/lessons/{lessonId}/complete")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<LessonProgress> markLessonComplete(
            @PathVariable UUID enrollmentId,
            @PathVariable UUID lessonId
    ) {
        log.info("POST /course-content/enrollments/{}/lessons/{}/complete", enrollmentId, lessonId);
        try {
            LessonProgress progress = contentService.markLessonComplete(enrollmentId, lessonId);
            log.info("POST /course-content/enrollments/{}/lessons/{}/complete - Success. Progress ID: {}, Completed: {}", 
                    enrollmentId, lessonId, progress.getId(), progress.getIsCompleted());
            return ResponseEntity.ok(progress);
        } catch (RuntimeException e) {
            log.error("POST /course-content/enrollments/{}/lessons/{}/complete - Error: {}", enrollmentId, lessonId, e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("POST /course-content/enrollments/{}/lessons/{}/complete - Unexpected error: {}", enrollmentId, lessonId, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/lessons/{lessonId}/complete")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<LessonProgress> completeLesson(@PathVariable UUID lessonId) {
        log.info("POST /course-content/lessons/{}/complete", lessonId);
        try {
            LessonProgress progress = contentService.completeLessonByLessonId(lessonId);
            return ResponseEntity.ok(progress);
        } catch (Exception e) {
            log.error("POST /course-content/lessons/{}/complete - Error: {}", lessonId, e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/lessons/{lessonId}/progress")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<LessonProgress> getLessonProgress(@PathVariable UUID lessonId) {
        log.info("GET /course-content/lessons/{}/progress", lessonId);
        try {
            LessonProgress progress = contentService.getLessonProgressByLessonId(lessonId);
            return ResponseEntity.ok(progress);
        } catch (Exception e) {
            log.error("GET /course-content/lessons/{}/progress - Error: {}", lessonId, e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }
}
