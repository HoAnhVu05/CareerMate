package vn.careermate.userservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;
import vn.careermate.userservice.repository.RecruiterProfileRepository;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExpertSeeder implements CommandLineRunner {

    private final RecruiterProfileRepository recruiterProfileRepository;

    @Override
    public void run(String... args) throws Exception {
        log.info("Checking for recruiters to mark as experts...");
        try {
            var profiles = recruiterProfileRepository.findAll();
            long count = 0;
            for (var profile : profiles) {
                if (profile.getIsExpert() == null || !profile.getIsExpert()) {
                    profile.setIsExpert(true);
                    recruiterProfileRepository.save(profile);
                    count++;
                }
            }
            if (count > 0) {
                log.info("Successfully marked {} recruiters as experts.", count);
            } else {
                log.info("No new recruiters to mark as experts.");
            }
        } catch (Exception e) {
            log.error("Error seeding experts: {}", e.getMessage());
        }
    }
}
