package vn.careermate.contentservice.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.careermate.contentservice.model.Company;
import vn.careermate.contentservice.model.CompanyRating;
// import vn.careermate.userservice.model.StudentProfile; // Replaced with Feign Client
import vn.careermate.contentservice.repository.CompanyRatingRepository;
import vn.careermate.contentservice.repository.CompanyRepository;
// import vn.careermate.userservice.repository.StudentProfileRepository; // Replaced with Feign Client
// import vn.careermate.userservice.repository.UserRepository; // Replaced with Feign Client
import vn.careermate.common.client.UserServiceClient;
import vn.careermate.common.dto.UserDTO;
import vn.careermate.common.dto.StudentProfileDTO;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CompanyRatingService {

    private final CompanyRatingRepository ratingRepository;
    private final CompanyRepository companyRepository;
    private final UserServiceClient userServiceClient;
    private final vn.careermate.common.client.NotificationServiceClient notificationServiceClient;

    @Transactional(readOnly = true)
    public List<CompanyRating> getCompanyRatings(UUID companyId) {
        return ratingRepository.findByCompanyId(companyId);
    }

    public Double getAverageRating(UUID companyId) {
        Double avg = ratingRepository.getAverageRatingByCompanyId(companyId);
        return avg != null ? avg : 0.0;
    }
    
    @Transactional(readOnly = true)
    public CompanyRating getMyRating(UUID companyId) {
        try {
            UUID studentId = getCurrentStudentId();
            return ratingRepository.findByCompanyIdAndStudentId(companyId, studentId);
        } catch (Exception e) {
            return null;
        }
    }
    
    @Transactional
    public void deleteMyRating(UUID companyId) {
        UUID studentId = getCurrentStudentId();
        CompanyRating rating = ratingRepository.findByCompanyIdAndStudentId(companyId, studentId);
        if (rating != null) {
            ratingRepository.delete(rating);
        }
    }

    @Transactional
    public CompanyRating createOrUpdateRating(UUID companyId, Integer rating, String reviewText) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));
        
        UUID studentId = getCurrentStudentId();
        StudentProfileDTO studentProfile = null;
        
        // Verify student exists via UserServiceClient
        try {
            studentProfile = userServiceClient.getStudentProfileById(studentId);
            if (studentProfile == null) {
                throw new RuntimeException("Student not found");
            }
        } catch (Exception e) {
            throw new RuntimeException("Student not found: " + e.getMessage());
        }

        // Check if rating exists
        CompanyRating ratingToSave;
        boolean isNew = false;
        
        CompanyRating existingRating = ratingRepository.findByCompanyId(companyId).stream()
                .filter(r -> r.getStudentId().equals(studentId))
                .findFirst()
                .orElse(null);

        if (existingRating != null) {
            existingRating.setRating(rating);
            existingRating.setReviewText(reviewText);
            ratingToSave = existingRating;
        } else {
            isNew = true;
            CompanyRating newRating = new CompanyRating();
            newRating.setCompany(company);
            newRating.setStudentId(studentId);
            newRating.setRating(rating);
            newRating.setReviewText(reviewText);
            ratingToSave = newRating;
        }
        
        CompanyRating savedRating = ratingRepository.save(ratingToSave);
        
        // Notification Logic
        try {
            // Find recruiter who owns this company
            vn.careermate.common.dto.RecruiterProfileDTO recruiter = userServiceClient.getRecruiterByCompanyId(companyId);
            
            if (recruiter != null && recruiter.getUserId() != null) {
                // Determine user name
                String studentName = "Sinh viên";
                try {
                     // Try to fetch user details for name
                     vn.careermate.common.dto.UserDTO studentUser = userServiceClient.getUserById(studentProfile.getUserId());
                     if (studentUser != null && studentUser.getFullName() != null) {
                         studentName = studentUser.getFullName();
                     }
                } catch (Exception ignore) {}

                String message = studentName + (isNew ? " đã đánh giá công ty bạn: " : " đã cập nhật đánh giá công ty bạn: ") + rating + " sao.";
                
                vn.careermate.common.dto.NotificationRequest notif = new vn.careermate.common.dto.NotificationRequest();
                notif.setUserId(recruiter.getUserId());
                notif.setTitle("Đánh giá mới");
                notif.setMessage(message);
                notif.setType("COMPANY_RATING");
                notif.setRelatedId(companyId);
                
                notificationServiceClient.createNotification(notif);
                // Simple logging for verification
                System.out.println("LOG: Sent notification to Recruiter " + recruiter.getUserId() + " (" + message + ")");
            } else {
                System.out.println("LOG: No recruiter found for Company " + companyId);
            }
        } catch (Exception e) {
            // Log error but don't fail transaction
            System.err.println("LOG: Error sending notification: " + e.getMessage());
        }
        
        return savedRating;
    }

    private UUID getCurrentStudentId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        UserDTO user = userServiceClient.getUserByEmail(email);
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        
        StudentProfileDTO profile = userServiceClient.getStudentProfileByUserId(user.getId());
        if (profile == null) {
            throw new RuntimeException("Student profile not found");
        }
        
        return profile.getId();
    }
}
