package vn.careermate.contentservice.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import vn.careermate.contentservice.model.Article;
import vn.careermate.contentservice.model.Company;
import vn.careermate.contentservice.repository.ArticleRepository;
import vn.careermate.contentservice.repository.CompanyRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final ArticleRepository articleRepository;
    private final CompanyRepository companyRepository;

    @Override
    public void run(String... args) throws Exception {
        try {
            // Cleanup fake data as per user request
            cleanupFakeCompanies();
            cleanupFakeArticles();
        } catch (Exception e) {
            log.error("Error cleaning up data: {}", e.getMessage(), e);
        }
    }

    private void cleanupFakeCompanies() {
        List<String> fakeNames = List.of("FPT Software", "VNG Corporation", "Viettel Group", "Momo");
        for (String name : fakeNames) {
            try {
                companyRepository.findAll().stream()
                    .filter(c -> name.equals(c.getName()))
                    .forEach(companyRepository::delete);
            } catch (Exception e) {
                log.warn("Could not delete company {}: {}", name, e.getMessage());
            }
        }
        log.info("Cleaned up fake companies.");
    }

    private void cleanupFakeArticles() {
        List<String> fakeTitles = List.of(
            "Top 10 Kỹ năng mềm cần thiết cho sinh viên mới ra trường",
            "Cách viết CV ấn tượng với nhà tuyển dụng",
            "Bí quyết phỏng vấn thành công tại các tập đoàn lớn"
        );
        
        for (String title : fakeTitles) {
            try {
                articleRepository.findAll().stream()
                    .filter(a -> title.equals(a.getTitle()))
                    .forEach(articleRepository::delete);
            } catch (Exception e) {
                log.warn("Could not delete article {}: {}", title, e.getMessage());
            }
        }
        log.info("Cleaned up fake articles.");
    }
}

