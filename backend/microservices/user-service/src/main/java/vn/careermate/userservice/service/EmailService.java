package vn.careermate.userservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@careermate.vn}")
    private String fromEmail;

    public void sendGenericEmail(String to, String subject, String body) {
        log.info("Sending generic email to: {} with subject: {}", to, subject);
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body + "\n\nTrân trọng,\nĐội ngũ CareerMate");
        
        try {
            mailSender.send(message);
        } catch (Exception e) {
            log.error("Failed to send generic email. Error: {}", e.getMessage());
        }
    }

    public void sendOtpEmail(String to, String otp, String situation) {
        log.info("Sending OTP email to: {} for situation: {}", to, situation);
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject("[CareerMate] " + situation);
        
        String content = "Chào bạn,\n\n" +
                situation + ":\n\n" +
                "MÃ XÁC THỰC: " + otp + "\n\n" +
                "Mã này có hiệu lực trong 5 phút. Vui lòng không chia sẻ mã này với bất kỳ ai.\n\n" +
                "Thân mến,\n" +
                "Đội ngũ CareerMate";
        
        message.setText(content);
        
        try {
            mailSender.send(message);
            log.info("Successfully sent OTP email to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send OTP email to: {}. Error: {}", to, e.getMessage());
            log.info("[DEV ONLY] Your OTP is: {}", otp);
        }
    }

}
