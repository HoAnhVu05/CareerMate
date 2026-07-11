package vn.careermate.notificationservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Async
    public void sendEmail(String to, String subject, String body) {
        try {
            log.info("Sending notification email to {} with subject: {}", to, subject);
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("noreply@careermate.vn");
            message.setTo(to);
            message.setSubject("[CareerMate] " + subject);
            message.setText(body + "\n\n---\nĐây là email tự động từ hệ thống CareerMate. Vui lòng không trả lời email này.");
            
            mailSender.send(message);
            log.info("Successfully sent notification email to {}", to);
        } catch (Exception e) {
            log.error("Failed to send notification email to {}: {}", to, e.getMessage());
        }
    }
}
