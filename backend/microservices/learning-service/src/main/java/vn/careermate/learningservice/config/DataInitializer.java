package vn.careermate.learningservice.config;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import vn.careermate.learningservice.model.Package;
import vn.careermate.learningservice.model.Challenge;
import vn.careermate.learningservice.model.Badge;
import vn.careermate.learningservice.model.Course;
import vn.careermate.learningservice.model.CourseModule;
import vn.careermate.learningservice.model.Lesson;
import vn.careermate.learningservice.model.Quiz;
import vn.careermate.learningservice.model.QuizQuestion;
import vn.careermate.learningservice.model.CVTemplate;
import vn.careermate.learningservice.repository.PackageRepository;
import vn.careermate.learningservice.repository.ChallengeRepository;
import vn.careermate.learningservice.repository.BadgeRepository;
import vn.careermate.learningservice.repository.CourseRepository;
import vn.careermate.learningservice.repository.CourseModuleRepository;
import vn.careermate.learningservice.repository.LessonRepository;
import vn.careermate.learningservice.repository.QuizRepository;
import vn.careermate.learningservice.repository.QuizQuestionRepository;
import vn.careermate.learningservice.repository.CVTemplateRepository;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Slf4j
@Component
@Order(1)
@RequiredArgsConstructor
public class DataInitializer {

    private final PackageRepository packageRepository;
    private final ChallengeRepository challengeRepository;
    private final BadgeRepository badgeRepository;
    private final CourseRepository courseRepository;
    private final CourseModuleRepository courseModuleRepository;
    private final LessonRepository lessonRepository;
    private final QuizRepository quizRepository;
    private final QuizQuestionRepository quizQuestionRepository;
    private final CVTemplateRepository cvTemplateRepository;

    @PostConstruct
    public void initPackages() {
        long count = packageRepository.count();
        
        // Always update existing packages to ensure correct encoding
        if (count > 0) {
            log.info("Found {} existing packages, updating with correct UTF-8 encoding...", count);
            List<Package> existing = packageRepository.findAll();
            boolean updated = false;
            for (Package pkg : existing) {
                String oldName = pkg.getName();
                // Update based on duration_days
                switch (pkg.getDurationDays()) {
                    case 30:
                        pkg.setName("Gói Cơ bản");
                        pkg.setDescription("Gói dịch vụ cơ bản, phù hợp cho sinh viên mới bắt đầu tìm kiếm việc làm");
                        pkg.setFeatures(Arrays.asList(
                            "Xem tất cả tin tuyển dụng",
                            "Tạo CV từ mẫu",
                            "Ứng tuyển 10 vị trí/tháng",
                            "Xem bài viết hướng nghiệp"
                        ));
                        break;
                    case 90:
                        pkg.setName("Gói Premium");
                        pkg.setDescription("Gói dịch vụ cao cấp với nhiều tính năng ưu đãi, hỗ trợ tốt hơn cho công việc tìm kiếm");
                        pkg.setFeatures(Arrays.asList(
                            "Xem tất cả tin tuyển dụng",
                            "Ứng tuyển không giới hạn",
                            "Tạo CV không giới hạn",
                            "Ưu tiên trong kết quả tìm kiếm",
                            "Truy cập khóa học premium",
                            "Tư vấn nghề nghiệp từ chuyên gia"
                        ));
                        break;
                    case 180:
                        pkg.setName("Gói Sinh viên Pro");
                        pkg.setDescription("Gói dành riêng cho sinh viên, hỗ trợ tối đa quá trình tìm việc và phát triển sự nghiệp");
                        pkg.setFeatures(Arrays.asList(
                            "Tất cả tính năng Premium",
                            "Mock Interview không giới hạn",
                            "Phân tích CV bằng AI",
                            "Job recommendations cá nhân hóa",
                            "Tham gia thử thách và nhận badge",
                            "Truy cập toàn bộ khóa học"
                        ));
                        break;
                    case 365:
                        pkg.setName("Gói Thăng tiến Sự nghiệp");
                        pkg.setDescription("Gói dịch vụ cao cấp nhất, hỗ trợ toàn diện cho sự nghiệp của bạn");
                        pkg.setFeatures(Arrays.asList(
                            "Tất cả tính năng Student Pro",
                            "Career roadmap cá nhân hóa",
                            "Mentoring 1-1 từ chuyên gia",
                            "Workshop và sự kiện độc quyền",
                            "Hỗ trợ viết cover letter chuyên nghiệp",
                            "Theo dõi tiến độ ứng tuyển chi tiết",
                            "Nhận thông báo việc làm phù hợp đầu tiên"
                        ));
                        break;
                }
                if (!pkg.getName().equals(oldName)) {
                    updated = true;
                    log.info("Updating package: {} -> {}", oldName, pkg.getName());
                }
            }
            if (updated) {
                packageRepository.saveAll(existing);
                log.info("Updated {} packages with correct UTF-8 encoding", existing.size());
            } else {
                log.info("All packages already have correct encoding");
            }
            return;
        }

        log.info("Initializing packages...");

        List<Package> packages = Arrays.asList(
            Package.builder()
                .name("Gói Cơ bản")
                .description("Gói dịch vụ cơ bản, phù hợp cho sinh viên mới bắt đầu tìm kiếm việc làm")
                .price(BigDecimal.ZERO)
                .durationDays(30)
                .features(Arrays.asList(
                    "Xem tất cả tin tuyển dụng",
                    "Tạo CV từ mẫu",
                    "Ứng tuyển 10 vị trí/tháng",
                    "Xem bài viết hướng nghiệp"
                ))
                .isActive(true)
                .build(),
            Package.builder()
                .name("Gói Premium")
                .description("Gói dịch vụ cao cấp với nhiều tính năng ưu đãi, hỗ trợ tốt hơn cho công việc tìm kiếm")
                .price(BigDecimal.ZERO)
                .durationDays(90)
                .features(Arrays.asList(
                    "Xem tất cả tin tuyển dụng",
                    "Ứng tuyển không giới hạn",
                    "Tạo CV không giới hạn",
                    "Ưu tiên trong kết quả tìm kiếm",
                    "Truy cập khóa học premium",
                    "Tư vấn nghề nghiệp từ chuyên gia"
                ))
                .isActive(true)
                .build(),
            Package.builder()
                .name("Gói Sinh viên Pro")
                .description("Gói dành riêng cho sinh viên, hỗ trợ tối đa quá trình tìm việc và phát triển sự nghiệp")
                .price(BigDecimal.ZERO)
                .durationDays(180)
                .features(Arrays.asList(
                    "Tất cả tính năng Premium",
                    "Mock Interview không giới hạn",
                    "Phân tích CV bằng AI",
                    "Job recommendations cá nhân hóa",
                    "Tham gia thử thách và nhận badge",
                    "Truy cập toàn bộ khóa học"
                ))
                .isActive(true)
                .build(),
            Package.builder()
                .name("Gói Thăng tiến Sự nghiệp")
                .description("Gói dịch vụ cao cấp nhất, hỗ trợ toàn diện cho sự nghiệp của bạn")
                .price(BigDecimal.ZERO)
                .durationDays(365)
                .features(Arrays.asList(
                    "Tất cả tính năng Student Pro",
                    "Career roadmap cá nhân hóa",
                    "Mentoring 1-1 từ chuyên gia",
                    "Workshop và sự kiện độc quyền",
                    "Hỗ trợ viết cover letter chuyên nghiệp",
                    "Theo dõi tiến độ ứng tuyển chi tiết",
                    "Nhận thông báo việc làm phù hợp đầu tiên"
                ))
                .isActive(true)
                .build()
        );

        packageRepository.saveAll(packages);
        log.info("Successfully initialized {} packages", packages.size());
    }

    @PostConstruct
    @Order(2)
    public void initCourses() {
        log.info("Initializing courses...");
        
        // Get existing courses to avoid duplicates
        List<Course> existingCourses = courseRepository.findAll();
        Map<String, Course> existingByTitle = existingCourses.stream()
                .collect(java.util.stream.Collectors.toMap(Course::getTitle, c -> c, (a, b) -> a));
        
        List<Course> courses = Arrays.asList(
            Course.builder()
                .title("Kỹ năng viết CV chuyên nghiệp")
                .description("Học cách tạo CV ấn tượng, thu hút nhà tuyển dụng với các mẹo và kỹ thuật chuyên nghiệp")
                .instructor("Nguyễn Văn A")
                .category("CV")
                .level(Course.CourseLevel.BEGINNER)
                .durationHours(5)
                .price(BigDecimal.ZERO)
                .isPremium(false)
                .thumbnailUrl("/images/courses/cv-writing.jpg")
                .build(),
            Course.builder()
                .title("Chuẩn bị phỏng vấn xin việc")
                .description("Nắm vững các kỹ thuật trả lời câu hỏi phỏng vấn, cách thể hiện bản thân và gây ấn tượng với nhà tuyển dụng")
                .instructor("Trần Thị B")
                .category("INTERVIEW")
                .level(Course.CourseLevel.INTERMEDIATE)
                .durationHours(8)
                .price(BigDecimal.ZERO)
                .isPremium(false)
                .thumbnailUrl("/images/courses/interview-prep.jpg")
                .build(),
            Course.builder()
                .title("Lập kế hoạch sự nghiệp 5 năm")
                .description("Xây dựng roadmap sự nghiệp rõ ràng, đặt mục tiêu và lập kế hoạch hành động để đạt được thành công")
                .instructor("Lê Văn C")
                .category("CAREER")
                .level(Course.CourseLevel.INTERMEDIATE)
                .durationHours(10)
                .price(new BigDecimal("500000"))
                .isPremium(true)
                .thumbnailUrl("/images/courses/career-planning.jpg")
                .build(),
            Course.builder()
                .title("Kỹ năng giao tiếp trong công việc")
                .description("Phát triển kỹ năng giao tiếp hiệu quả, thuyết trình và làm việc nhóm trong môi trường chuyên nghiệp")
                .instructor("Phạm Thị D")
                .category("SKILL")
                .level(Course.CourseLevel.BEGINNER)
                .durationHours(6)
                .price(BigDecimal.ZERO)
                .isPremium(false)
                .thumbnailUrl("/images/courses/communication.jpg")
                .build(),
            Course.builder()
                .title("Xây dựng thương hiệu cá nhân")
                .description("Tạo dựng hình ảnh chuyên nghiệp trên LinkedIn và các nền tảng mạng xã hội, thu hút cơ hội việc làm")
                .instructor("Hoàng Văn E")
                .category("CAREER")
                .level(Course.CourseLevel.ADVANCED)
                .durationHours(12)
                .price(new BigDecimal("800000"))
                .isPremium(true)
                .thumbnailUrl("/images/courses/personal-branding.jpg")
                .build(),
            Course.builder()
                .title("Kỹ năng quản lý thời gian")
                .description("Học cách sắp xếp công việc hiệu quả, tăng năng suất và cân bằng cuộc sống")
                .instructor("Võ Thị F")
                .category("SKILL")
                .level(Course.CourseLevel.BEGINNER)
                .durationHours(4)
                .price(BigDecimal.ZERO)
                .isPremium(false)
                .thumbnailUrl("/images/courses/time-management.jpg")
                .build(),
            Course.builder()
                .title("Nghệ thuật đàm phán lương")
                .description("Kỹ thuật đàm phán mức lương phù hợp, cách trình bày giá trị bản thân và đạt được thỏa thuận tốt nhất")
                .instructor("Đặng Văn G")
                .category("CAREER")
                .level(Course.CourseLevel.ADVANCED)
                .durationHours(7)
                .price(new BigDecimal("600000"))
                .isPremium(true)
                .thumbnailUrl("/images/courses/salary-negotiation.jpg")
                .build(),
            Course.builder()
                .title("Kỹ năng làm việc nhóm hiệu quả")
                .description("Phát triển khả năng hợp tác, giải quyết xung đột và đóng góp tích cực vào thành công của team")
                .instructor("Bùi Thị H")
                .category("SKILL")
                .level(Course.CourseLevel.INTERMEDIATE)
                .durationHours(6)
                .price(BigDecimal.ZERO)
                .isPremium(false)
                .thumbnailUrl("/images/courses/teamwork.jpg")
                .build(),
            // Programming Courses - Java
            Course.builder()
                .title("Java cơ bản cho người mới bắt đầu")
                .description("Học Java từ con số 0, nắm vững các khái niệm cơ bản, OOP, collections và exception handling")
                .instructor("Trần Văn Java")
                .category("TECHNICAL")
                .level(Course.CourseLevel.BEGINNER)
                .durationHours(20)
                .price(BigDecimal.ZERO)
                .isPremium(false)
                .thumbnailUrl("/images/courses/java-basic.jpg")
                .build(),
            Course.builder()
                .title("Java nâng cao và Spring Framework")
                .description("Nâng cao kỹ năng Java, học Spring Boot, Spring MVC, JPA/Hibernate và xây dựng RESTful APIs")
                .instructor("Nguyễn Spring Master")
                .category("TECHNICAL")
                .level(Course.CourseLevel.INTERMEDIATE)
                .durationHours(30)
                .price(new BigDecimal("1000000"))
                .isPremium(true)
                .thumbnailUrl("/images/courses/java-spring.jpg")
                .build(),
            Course.builder()
                .title("Spring Boot Microservices")
                .description("Xây dựng hệ thống microservices với Spring Boot, Eureka, Feign Client và API Gateway")
                .instructor("Lê Microservices")
                .category("TECHNICAL")
                .level(Course.CourseLevel.ADVANCED)
                .durationHours(25)
                .price(new BigDecimal("1500000"))
                .isPremium(true)
                .thumbnailUrl("/images/courses/spring-microservices.jpg")
                .build(),
            // Programming Courses - Python
            Course.builder()
                .title("Python cơ bản")
                .description("Học Python từ đầu, làm quen với syntax, data structures, functions và modules")
                .instructor("Phạm Python")
                .category("TECHNICAL")
                .level(Course.CourseLevel.BEGINNER)
                .durationHours(15)
                .price(BigDecimal.ZERO)
                .isPremium(false)
                .thumbnailUrl("/images/courses/python-basic.jpg")
                .build(),
            Course.builder()
                .title("Python nâng cao và Django")
                .description("Lập trình Python nâng cao, học Django framework để xây dựng web applications")
                .instructor("Hoàng Django")
                .category("TECHNICAL")
                .level(Course.CourseLevel.INTERMEDIATE)
                .durationHours(28)
                .price(new BigDecimal("1200000"))
                .isPremium(true)
                .thumbnailUrl("/images/courses/python-django.jpg")
                .build(),
            Course.builder()
                .title("Data Science với Python")
                .description("Phân tích dữ liệu với Pandas, NumPy, Matplotlib và Machine Learning cơ bản")
                .instructor("Võ Data Science")
                .category("TECHNICAL")
                .level(Course.CourseLevel.ADVANCED)
                .durationHours(35)
                .price(new BigDecimal("2000000"))
                .isPremium(true)
                .thumbnailUrl("/images/courses/python-datascience.jpg")
                .build(),
            // Programming Courses - JavaScript/Web
            Course.builder()
                .title("JavaScript cơ bản")
                .description("Học JavaScript từ đầu, DOM manipulation, events, async/await và ES6+ features")
                .instructor("Đặng JavaScript")
                .category("TECHNICAL")
                .level(Course.CourseLevel.BEGINNER)
                .durationHours(18)
                .price(BigDecimal.ZERO)
                .isPremium(false)
                .thumbnailUrl("/images/courses/javascript-basic.jpg")
                .build(),
            Course.builder()
                .title("React.js từ cơ bản đến nâng cao")
                .description("Xây dựng ứng dụng web hiện đại với React, Hooks, Context API, Redux và React Router")
                .instructor("Bùi React")
                .category("TECHNICAL")
                .level(Course.CourseLevel.INTERMEDIATE)
                .durationHours(32)
                .price(new BigDecimal("1500000"))
                .isPremium(true)
                .thumbnailUrl("/images/courses/react.jpg")
                .build(),
            Course.builder()
                .title("Node.js và Express.js")
                .description("Xây dựng backend APIs với Node.js, Express.js, MongoDB và JWT authentication")
                .instructor("Trương Node.js")
                .category("TECHNICAL")
                .level(Course.CourseLevel.INTERMEDIATE)
                .durationHours(24)
                .price(new BigDecimal("1300000"))
                .isPremium(true)
                .thumbnailUrl("/images/courses/nodejs.jpg")
                .build(),
            Course.builder()
                .title("Full Stack Development với MERN")
                .description("Xây dựng ứng dụng full stack với MongoDB, Express, React và Node.js")
                .instructor("Vũ Full Stack")
                .category("TECHNICAL")
                .level(Course.CourseLevel.ADVANCED)
                .durationHours(40)
                .price(new BigDecimal("2500000"))
                .isPremium(true)
                .thumbnailUrl("/images/courses/mern.jpg")
                .build(),
            // Programming Courses - Other Technologies
            Course.builder()
                .title("HTML, CSS và JavaScript cơ bản")
                .description("Học web development cơ bản với HTML5, CSS3 và JavaScript vanilla")
                .instructor("Ngô Web Dev")
                .category("TECHNICAL")
                .level(Course.CourseLevel.BEGINNER)
                .durationHours(12)
                .price(BigDecimal.ZERO)
                .isPremium(false)
                .thumbnailUrl("/images/courses/html-css-js.jpg")
                .build(),
            Course.builder()
                .title("Vue.js Framework")
                .description("Học Vue.js từ cơ bản, Vuex, Vue Router và xây dựng Single Page Applications")
                .instructor("Đỗ Vue.js")
                .category("TECHNICAL")
                .level(Course.CourseLevel.INTERMEDIATE)
                .durationHours(22)
                .price(new BigDecimal("1100000"))
                .isPremium(true)
                .thumbnailUrl("/images/courses/vuejs.jpg")
                .build(),
            Course.builder()
                .title("TypeScript cho JavaScript Developers")
                .description("Nâng cao kỹ năng với TypeScript, type safety, interfaces và advanced types")
                .instructor("Lý TypeScript")
                .category("TECHNICAL")
                .level(Course.CourseLevel.INTERMEDIATE)
                .durationHours(16)
                .price(new BigDecimal("900000"))
                .isPremium(true)
                .thumbnailUrl("/images/courses/typescript.jpg")
                .build(),
            Course.builder()
                .title("Database Design và SQL")
                .description("Thiết kế database, viết SQL queries, stored procedures và database optimization")
                .instructor("Hồ SQL")
                .category("TECHNICAL")
                .level(Course.CourseLevel.INTERMEDIATE)
                .durationHours(20)
                .price(new BigDecimal("800000"))
                .isPremium(true)
                .thumbnailUrl("/images/courses/sql.jpg")
                .build(),
            Course.builder()
                .title("Git và GitHub cho Developers")
                .description("Quản lý code với Git, GitHub workflows, branching strategies và collaboration")
                .instructor("Phan Git")
                .category("TECHNICAL")
                .level(Course.CourseLevel.BEGINNER)
                .durationHours(8)
                .price(BigDecimal.ZERO)
                .isPremium(false)
                .thumbnailUrl("/images/courses/git.jpg")
                .build(),
            Course.builder()
                .title("Docker và Containerization")
                .description("Containerize applications với Docker, Docker Compose và deployment strategies")
                .instructor("Vương Docker")
                .category("TECHNICAL")
                .level(Course.CourseLevel.ADVANCED)
                .durationHours(18)
                .price(new BigDecimal("1400000"))
                .isPremium(true)
                .thumbnailUrl("/images/courses/docker.jpg")
                .build(),
            Course.builder()
                .title("AWS Cloud Computing cơ bản")
                .description("Học AWS services, EC2, S3, RDS và deploy applications lên cloud")
                .instructor("Tạ AWS")
                .category("TECHNICAL")
                .level(Course.CourseLevel.ADVANCED)
                .durationHours(30)
                .price(new BigDecimal("2200000"))
                .isPremium(true)
                .thumbnailUrl("/images/courses/aws.jpg")
                .build()
        );
        
        // Filter out courses that already exist (using existingByTitle from above)
        List<Course> newCourses = courses.stream()
                .filter(course -> !existingByTitle.containsKey(course.getTitle()))
                .collect(java.util.stream.Collectors.toList());
        
        if (!newCourses.isEmpty()) {
            courseRepository.saveAll(newCourses);
            log.info("Successfully added {} new courses ({} already exist)", newCourses.size(), courses.size() - newCourses.size());
        } else {
            log.info("All courses already exist, no new courses to add");
        }
    }

    @PostConstruct
    public void initBadges() {
        long count = badgeRepository.count();
        if (count > 0) {
            log.info("Badges already exist ({} badges), skipping initialization", count);
            return;
        }
        
        log.info("Initializing badges...");
        List<Badge> badges = Arrays.asList(
            Badge.builder()
                .name("Chuyên gia CV")
                .description("Hoàn thành thử thách viết CV chuyên nghiệp")
                .category("CV")
                .rarity(Badge.BadgeRarity.COMMON)
                .iconUrl("/images/badges/cv-expert.png")
                .build(),
            Badge.builder()
                .name("Bậc thầy phỏng vấn")
                .description("Hoàn thành thử thách chuẩn bị phỏng vấn")
                .category("INTERVIEW")
                .rarity(Badge.BadgeRarity.RARE)
                .iconUrl("/images/badges/interview-master.png")
                .build(),
            Badge.builder()
                .name("Nhà hoạch định sự nghiệp")
                .description("Hoàn thành thử thách lập kế hoạch sự nghiệp")
                .category("CAREER")
                .rarity(Badge.BadgeRarity.RARE)
                .iconUrl("/images/badges/career-planner.png")
                .build(),
            Badge.builder()
                .name("Kỹ sư tài năng")
                .description("Hoàn thành thử thách nâng cao kỹ năng kỹ thuật")
                .category("SKILL")
                .rarity(Badge.BadgeRarity.EPIC)
                .iconUrl("/images/badges/tech-expert.png")
                .build(),
            Badge.builder()
                .name("Người kết nối")
                .description("Hoàn thành thử thách xây dựng mạng lưới nghề nghiệp")
                .category("CAREER")
                .rarity(Badge.BadgeRarity.COMMON)
                .iconUrl("/images/badges/networker.png")
                .build()
        );
        
        badgeRepository.saveAll(badges);
        log.info("Successfully initialized {} badges", badges.size());
    }

    @PostConstruct
    public void initChallenges() {
        // First ensure badges exist
        initBadges();
        
        // Get badges by category for assignment
        Map<String, Badge> badgesByCategory = new HashMap<>();
        badgeRepository.findAll().forEach(badge -> {
            if (badge.getCategory() != null) {
                badgesByCategory.put(badge.getCategory(), badge);
            }
        });
        log.info("Found {} badges for assignment: {}", badgesByCategory.size(), badgesByCategory.keySet());
        
        long count = challengeRepository.count();
        
        // Always update existing challenges to ensure correct encoding AND badge assignment
        if (count > 0) {
            log.info("Found {} existing challenges, updating with correct UTF-8 encoding...", count);
            List<Challenge> existing = challengeRepository.findAll();
            boolean updated = false;
            for (Challenge challenge : existing) {
                String oldTitle = challenge.getTitle();
                // Update based on category
                switch (challenge.getCategory()) {
                    case "CV":
                        challenge.setTitle("Viết CV chuyên nghiệp");
                        challenge.setDescription("Tạo một CV hoàn chỉnh và chuyên nghiệp với đầy đủ thông tin cá nhân, học vấn, kinh nghiệm và kỹ năng");
                        challenge.setInstructions("1. Tạo CV mới trên hệ thống\n2. Điền đầy đủ thông tin cá nhân\n3. Thêm ít nhất 2 kinh nghiệm làm việc hoặc dự án\n4. Liệt kê ít nhất 5 kỹ năng\n5. Upload CV đã hoàn thành");
                        challenge.setExpectedKeywords("CV, thông tin cá nhân, kinh nghiệm, kỹ năng, học vấn");
                        if (challenge.getBadgeId() == null && badgesByCategory.containsKey("CV")) {
                            challenge.setBadgeId(badgesByCategory.get("CV").getId());
                            updated = true;
                            log.info("Assigned CV badge to challenge: {}", challenge.getTitle());
                        }
                        break;
                    case "INTERVIEW":
                        challenge.setTitle("Chuẩn bị phỏng vấn");
                        challenge.setDescription("Hoàn thành bài test phỏng vấn và đạt điểm trên 80%");
                        challenge.setInstructions("1. Tham gia bài test phỏng vấn\n2. Trả lời ít nhất 10 câu hỏi\n3. Đạt điểm tối thiểu 80%\n4. Nộp kết quả");
                        challenge.setExpectedKeywords("phỏng vấn, câu hỏi, trả lời, điểm số");
                        if (challenge.getBadgeId() == null && badgesByCategory.containsKey("INTERVIEW")) {
                            challenge.setBadgeId(badgesByCategory.get("INTERVIEW").getId());
                            updated = true;
                            log.info("Assigned INTERVIEW badge to challenge: {}", challenge.getTitle());
                        }
                        break;
                    case "CAREER":
                        if (challenge.getDifficulty() != null && challenge.getDifficulty().equals("MEDIUM")) {
                            challenge.setTitle("Lập kế hoạch sự nghiệp");
                            challenge.setDescription("Tạo roadmap sự nghiệp 5 năm với các mục tiêu cụ thể và kế hoạch hành động");
                            challenge.setInstructions("1. Xác định mục tiêu sự nghiệp\n2. Vạch ra roadmap 5 năm\n3. Liệt kê các kỹ năng cần phát triển\n4. Đề xuất các bước hành động cụ thể\n5. Nộp bản kế hoạch");
                            challenge.setExpectedKeywords("kế hoạch, mục tiêu, roadmap, sự nghiệp, phát triển");
                            if (challenge.getBadgeId() == null && badgesByCategory.containsKey("CAREER")) {
                                challenge.setBadgeId(badgesByCategory.get("CAREER").getId());
                            }
                        } else {
                            challenge.setTitle("Xây dựng mạng lưới nghề nghiệp");
                            challenge.setDescription("Kết nối với ít nhất 10 người trong ngành và tham gia 2 sự kiện networking");
                            challenge.setInstructions("1. Kết nối với ít nhất 10 người trong ngành\n2. Tham gia 2 sự kiện networking\n3. Chia sẻ kinh nghiệm trên diễn đàn\n4. Nộp bằng chứng kết nối");
                            challenge.setExpectedKeywords("networking, kết nối, mạng lưới, sự kiện");
                            if (challenge.getBadgeId() == null && badgesByCategory.containsKey("CAREER")) {
                                challenge.setBadgeId(badgesByCategory.get("CAREER").getId());
                            }
                        }
                        break;
                    case "SKILL":
                        challenge.setTitle("Nâng cao kỹ năng kỹ thuật");
                        challenge.setDescription("Hoàn thành ít nhất 3 khóa học kỹ thuật và đạt chứng chỉ");
                        challenge.setInstructions("1. Đăng ký ít nhất 3 khóa học kỹ thuật\n2. Hoàn thành tất cả bài học\n3. Đạt điểm trung bình trên 75%\n4. Nhận chứng chỉ hoàn thành");
                        challenge.setExpectedKeywords("khóa học, kỹ năng kỹ thuật, chứng chỉ, hoàn thành");
                        if (challenge.getBadgeId() == null && badgesByCategory.containsKey("SKILL")) {
                            challenge.setBadgeId(badgesByCategory.get("SKILL").getId());
                        }
                        break;
                }
                if (!challenge.getTitle().equals(oldTitle)) {
                    updated = true;
                    log.info("Updating challenge: {} -> {}", oldTitle, challenge.getTitle());
                }
            }
            if (updated) {
                challengeRepository.saveAll(existing);
                log.info("Updated {} challenges with correct UTF-8 encoding and badge assignments", existing.size());
            } else {
                log.info("All challenges already have correct encoding and badges");
            }
            return;
        }

        log.info("Initializing challenges...");

        // Get badges for assignment
        Badge cvBadge = badgesByCategory.get("CV");
        Badge interviewBadge = badgesByCategory.get("INTERVIEW");
        Badge careerBadge = badgesByCategory.get("CAREER");
        Badge skillBadge = badgesByCategory.get("SKILL");
        
        List<Challenge> challenges = Arrays.asList(
            Challenge.builder()
                .title("Viết CV chuyên nghiệp")
                .description("Tạo một CV hoàn chỉnh và chuyên nghiệp với đầy đủ thông tin cá nhân, học vấn, kinh nghiệm và kỹ năng")
                .category("CV")
                .difficulty("EASY")
                .badgeId(cvBadge != null ? cvBadge.getId() : null)
                .startDate(null) // Always active
                .endDate(null) // Always active
                .passingScore(70)
                .instructions("1. Tạo CV mới trên hệ thống\n2. Điền đầy đủ thông tin cá nhân\n3. Thêm ít nhất 2 kinh nghiệm làm việc hoặc dự án\n4. Liệt kê ít nhất 5 kỹ năng\n5. Upload CV đã hoàn thành")
                .expectedKeywords("CV, thông tin cá nhân, kinh nghiệm, kỹ năng, học vấn")
                .build(),
            Challenge.builder()
                .title("Chuẩn bị phỏng vấn")
                .description("Hoàn thành bài test phỏng vấn và đạt điểm trên 80%")
                .category("INTERVIEW")
                .difficulty("MEDIUM")
                .badgeId(interviewBadge != null ? interviewBadge.getId() : null)
                .startDate(null)
                .endDate(null)
                .passingScore(80)
                .instructions("1. Tham gia bài test phỏng vấn\n2. Trả lời ít nhất 10 câu hỏi\n3. Đạt điểm tối thiểu 80%\n4. Nộp kết quả")
                .expectedKeywords("phỏng vấn, câu hỏi, trả lời, điểm số")
                .build(),
            Challenge.builder()
                .title("Lập kế hoạch sự nghiệp")
                .description("Tạo roadmap sự nghiệp 5 năm với các mục tiêu cụ thể và kế hoạch hành động")
                .category("CAREER")
                .difficulty("MEDIUM")
                .badgeId(careerBadge != null ? careerBadge.getId() : null)
                .startDate(null)
                .endDate(null)
                .passingScore(70)
                .instructions("1. Xác định mục tiêu sự nghiệp\n2. Vạch ra roadmap 5 năm\n3. Liệt kê các kỹ năng cần phát triển\n4. Đề xuất các bước hành động cụ thể\n5. Nộp bản kế hoạch")
                .expectedKeywords("kế hoạch, mục tiêu, roadmap, sự nghiệp, phát triển")
                .build(),
            Challenge.builder()
                .title("Nâng cao kỹ năng kỹ thuật")
                .description("Hoàn thành ít nhất 3 khóa học kỹ thuật và đạt chứng chỉ")
                .category("SKILL")
                .difficulty("HARD")
                .badgeId(skillBadge != null ? skillBadge.getId() : null)
                .startDate(null)
                .endDate(null)
                .passingScore(75)
                .instructions("1. Đăng ký ít nhất 3 khóa học kỹ thuật\n2. Hoàn thành tất cả bài học\n3. Đạt điểm trung bình trên 75%\n4. Nhận chứng chỉ hoàn thành")
                .expectedKeywords("khóa học, kỹ năng kỹ thuật, chứng chỉ, hoàn thành")
                .build(),
            Challenge.builder()
                .title("Xây dựng mạng lưới nghề nghiệp")
                .description("Kết nối với ít nhất 10 người trong ngành và tham gia 2 sự kiện networking")
                .category("CAREER")
                .difficulty("EASY")
                .badgeId(careerBadge != null ? careerBadge.getId() : null)
                .startDate(null)
                .endDate(null)
                .passingScore(70)
                .instructions("1. Kết nối với ít nhất 10 người trong ngành\n2. Tham gia 2 sự kiện networking\n3. Chia sẻ kinh nghiệm trên diễn đàn\n4. Nộp bằng chứng kết nối")
                .expectedKeywords("networking, kết nối, mạng lưới, sự kiện")
                .build()
        );

        challengeRepository.saveAll(challenges);
        log.info("Successfully initialized {} challenges", challenges.size());
    }

    @PostConstruct
    @Order(4)
    public void initCVTemplates() {
//        if (cvTemplateRepository.count() > 0) {
//            log.info("CV templates already exist, skipping initialization");
//            return;
//        }


        log.info("Initializing CV templates...");

        // Modern Template
        String modernHtml = """
            <div class="cv-container modern">
                <header class="header">
                    <div class="header-content">
                        <div class="profile-photo">
                            <img src="{{photoUrl}}" alt="{{fullName}}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
                            <div class="initials">{{initials}}</div>
                        </div>
                        <div class="header-text">
                            <h1>{{fullName}}</h1>
                            <h2>{{position}}</h2>
                            <div class="contact-info">
                                <span><i class="fas fa-envelope"></i> {{email}}</span>
                                <span><i class="fas fa-phone"></i> {{phone}}</span>
                                <span><i class="fas fa-map-marker-alt"></i> {{address}}</span>
                            </div>
                        </div>
                    </div>
                </header>
                <div class="main-content">
                    <aside class="sidebar">
                        <section class="skills">
                            <h3>Kỹ năng</h3>
                            <div class="skill-tags">
                                {{#each skills}}
                                <span class="skill-tag">{{this}}</span>
                                {{/each}}
                            </div>
                        </section>
                        <section class="social">
                            <h3>Liên kết</h3>
                            <ul>
                                <li><a href="{{linkedin}}">LinkedIn</a></li>
                                <li><a href="{{github}}">GitHub</a></li>
                            </ul>
                        </section>
                    </aside>
                    <div class="content">
                        <section class="summary">
                            <h3>Giới thiệu</h3>
                            <p>{{summary}}</p>
                        </section>
                        <section class="experience">
                            <h3>Kinh nghiệm làm việc</h3>
                            {{#each experience}}
                            <div class="job-item">
                                <h4>{{position}}</h4>
                                <div class="company">{{company}}</div>
                                <p>{{description}}</p>
                            </div>
                            {{/each}}
                        </section>
                        <section class="education">
                            <h3>Học vấn</h3>
                            {{#each education}}
                            <div class="edu-item">
                                <h4>{{school}}</h4>
                                <p>{{major}}</p>
                            </div>
                            {{/each}}
                        </section>
                    </div>
                </div>
            </div>
            """;
            
        String modernCss = """
            body { font-family: 'Inter', sans-serif; margin: 0; padding: 0; color: #333; }
            .cv-container { max-width: 800px; margin: 0 auto; background: white; min-height: 100vh; }
            .header { background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; padding: 40px; }
            .header-content { display: flex; align-items: center; gap: 30px; }
            .profile-photo { width: 120px; height: 120px; border-radius: 50%; border: 4px solid white; overflow: hidden; position: relative; background: #e5e7eb; }
            .profile-photo img { width: 100%; height: 100%; object-fit: cover; }
            .initials { display: none; width: 100%; height: 100%; align-items: center; justify-content: center; font-size: 40px; font-weight: bold; color: #2563eb; }
            h1 { margin: 0; font-size: 32px; }
            h2 { margin: 10px 0; font-size: 18px; opacity: 0.9; font-weight: normal; }
            .contact-info { display: flex; gap: 20px; font-size: 14px; opacity: 0.9; margin-top: 15px; }
            .main-content { display: flex; padding: 40px; gap: 40px; }
            .sidebar { width: 30%; }
            .content { width: 70%; }
            section { margin-bottom: 30px; }
            h3 { color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; margin-bottom: 20px; text-transform: uppercase; font-size: 16px; letter-spacing: 1px; }
            .skill-tags { display: flex; flex-wrap: wrap; gap: 10px; }
            .skill-tag { background: #eff6ff; color: #2563eb; padding: 5px 10px; border-radius: 4px; font-size: 14px; }
            .job-item, .edu-item { margin-bottom: 20px; }
            .job-item h4, .edu-item h4 { margin: 0 0 5px 0; font-size: 18px; }
            .company { color: #6b7280; font-weight: 500; margin-bottom: 10px; }
            ul { list-style: none; padding: 0; }
            a { color: #2563eb; text-decoration: none; }
            """;

        CVTemplate modern = CVTemplate.builder()
            .name("Modern Professional")
            .description("Mẫu CV hiện đại, chuyên nghiệp với bố cục rõ ràng, phù hợp cho mọi ngành nghề.")
            .category("MODERN")
            .isPremium(false)
            .templateHtml(modernHtml)
            .templateCss(modernCss)
            .previewImageUrl("/images/templates/modern.jpg")
            .build();

        // Creative Template
        String creativeHtml = """
            <div class="cv-container creative">
                <div class="left-panel">
                    <div class="profile-section">
                        <div class="photo-frame">
                            <img src="{{photoUrl}}" alt="{{fullName}}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
                            <div class="initials">{{initials}}</div>
                        </div>
                        <h1>{{fullName}}</h1>
                        <h2>{{position}}</h2>
                    </div>
                    <div class="contact-section">
                        <div class="contact-item"><i class="fas fa-envelope"></i> {{email}}</div>
                        <div class="contact-item"><i class="fas fa-phone"></i> {{phone}}</div>
                        <div class="contact-item"><i class="fas fa-map-marker-alt"></i> {{address}}</div>
                    </div>
                    <div class="skills-section">
                        <h3>Kỹ năng</h3>
                        <ul>
                            {{#each skills}}
                            <li>{{this}}</li>
                            {{/each}}
                        </ul>
                    </div>
                </div>
                <div class="right-panel">
                    <section>
                        <h3><i class="fas fa-user"></i> Giới thiệu</h3>
                        <p>{{summary}}</p>
                    </section>
                    <section>
                        <h3><i class="fas fa-briefcase"></i> Kinh nghiệm</h3>
                        {{#each experience}}
                        <div class="timeline-item">
                            <h4>{{position}}</h4>
                            <div class="subtitle">{{company}}</div>
                            <p>{{description}}</p>
                        </div>
                        {{/each}}
                    </section>
                    <section>
                        <h3><i class="fas fa-graduation-cap"></i> Học vấn</h3>
                        {{#each education}}
                        <div class="timeline-item">
                            <h4>{{school}}</h4>
                            <p>{{major}}</p>
                        </div>
                        {{/each}}
                    </section>
                </div>
            </div>
            """;

        String creativeCss = """
            body { font-family: 'Poppins', sans-serif; margin: 0; padding: 0; }
            .cv-container { display: flex; min-height: 100vh; }
            .left-panel { width: 35%; background: #1e293b; color: white; padding: 40px; text-align: center; }
            .right-panel { width: 65%; padding: 40px; background: #fff; }
            .photo-frame { width: 150px; height: 150px; margin: 0 auto 30px; border-radius: 20px; overflow: hidden; border: 4px solid #3b82f6; position: relative; background: #334155; }
            .photo-frame img { width: 100%; height: 100%; object-fit: cover; }
            .initials { display: none; width: 100%; height: 100%; align-items: center; justify-content: center; font-size: 50px; font-weight: bold; color: white; }
            h1 { font-size: 28px; margin-bottom: 10px; }
            h2 { font-size: 16px; color: #94a3b8; font-weight: normal; margin-bottom: 40px; text-transform: uppercase; letter-spacing: 2px; }
            .contact-item { margin-bottom: 15px; font-size: 14px; color: #e2e8f0; display: flex; align-items: center; justify-content: center; gap: 10px; }
            .skills-section h3 { color: #3b82f6; border-bottom: 1px solid #334155; padding-bottom: 10px; margin-top: 40px; }
            .skills-section ul { list-style: none; padding: 0; text-align: left; }
            .skills-section li { background: #334155; margin-bottom: 10px; padding: 10px; border-radius: 8px; font-size: 14px; }
            .right-panel h3 { color: #1e293b; font-size: 20px; border-left: 5px solid #3b82f6; padding-left: 15px; margin-bottom: 25px; display: flex; align-items: center; gap: 15px; }
            .timeline-item { margin-bottom: 30px; padding-left: 20px; border-left: 2px solid #e2e8f0; position: relative; }
            .timeline-item::before { content: ''; width: 12px; height: 12px; background: #3b82f6; border-radius: 50%; position: absolute; left: -7px; top: 5px; }
            .timeline-item h4 { margin: 0 0 5px 0; font-size: 18px; color: #1e293b; }
            .subtitle { color: #64748b; font-weight: 500; font-size: 14px; margin-bottom: 10px; }
            p { color: #475569; line-height: 1.6; }
            """;

        CVTemplate creative = CVTemplate.builder()
            .name("Creative Designer")
            .description("Thiết kế sáng tạo, nổi bật với sidebar tối màu và typography hiện đại.")
            .category("CREATIVE")
            .isPremium(true)
            .templateHtml(creativeHtml)
            .templateCss(creativeCss)
            .previewImageUrl("/images/templates/creative.jpg")
            .build();

        // Minimalist Template
        String minimalHtml = """
            <div class="cv-container minimal">
                <header>
                    <h1>{{fullName}}</h1>
                    <p class="role">{{position}}</p>
                    <div class="divider"></div>
                    <div class="contact">
                        <span>{{email}}</span> • <span>{{phone}}</span> • <span>{{address}}</span>
                    </div>
                </header>
                <div class="grid">
                    <div class="col-main">
                        <section>
                            <h3>Kinh nghiệm</h3>
                            {{#each experience}}
                            <div class="item">
                                <div class="row">
                                    <h4>{{company}}</h4>
                                    <span class="date">Present</span>
                                </div>
                                <h5>{{position}}</h5>
                                <p>{{description}}</p>
                            </div>
                            {{/each}}
                        </section>
                        <section>
                            <h3>Học vấn</h3>
                            {{#each education}}
                            <div class="item">
                                <h4>{{school}}</h4>
                                <p>{{major}}</p>
                            </div>
                            {{/each}}
                        </section>
                    </div>
                    <div class="col-side">
                        <section>
                            <h3>Kỹ năng</h3>
                            <div class="skills-list">
                                {{#each skills}}
                                <span>{{this}}</span>
                                {{/each}}
                            </div>
                        </section>
                        <section>
                            <h3>Giới thiệu</h3>
                            <p>{{summary}}</p>
                        </section>
                    </div>
                </div>
            </div>
            """;
            
        String minimalCss = """
            body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #333; line-height: 1.6; }
            .cv-container { max-width: 800px; margin: 0 auto; padding: 50px; background: white; }
            header { text-align: center; margin-bottom: 50px; }
            h1 { font-size: 36px; letter-spacing: 2px; text-transform: uppercase; margin: 0; font-weight: 300; }
            .role { font-size: 16px; color: #666; letter-spacing: 4px; text-transform: uppercase; margin-top: 10px; }
            .divider { width: 50px; height: 2px; background: #333; margin: 30px auto; }
            .contact { font-size: 14px; color: #666; }
            .grid { display: flex; gap: 50px; }
            .col-main { width: 65%; }
            .col-side { width: 35%; }
            h3 { font-size: 14px; text-transform: uppercase; letter-spacing: 2px; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; font-weight: bold; }
            .item { margin-bottom: 30px; }
            .row { display: flex; justify-content: space-between; align-items: baseline; }
            .item h4 { margin: 0; font-size: 16px; font-weight: bold; }
            .item h5 { margin: 5px 0 10px; font-size: 14px; font-style: italic; color: #666; font-weight: normal; }
            .date { font-size: 12px; color: #999; }
            .skills-list span { display: block; margin-bottom: 8px; font-size: 14px; border-bottom: 1px solid #eee; padding-bottom: 8px; }
            """;

        CVTemplate minimal = CVTemplate.builder()
            .name("Minimalist Elegant")
            .description("Đơn giản, tinh tế, tập trung vào nội dung. Hoàn hảo cho các vị trí quản lý.")
            .category("MINIMALIST")
            .isPremium(true)
            .templateHtml(minimalHtml)
            .templateCss(minimalCss)
            .previewImageUrl("/images/templates/minimal.jpg")
            .build();

        cvTemplateRepository.saveAll(Arrays.asList(modern, creative, minimal));
        log.info("Initialized 3 premium CV templates");
    }

    @PostConstruct
    @Order(5)
    public void initCourseContent() {
        try {
            log.info("Initializing course content (modules, lessons, quizzes)...");
            
            List<Course> courses = courseRepository.findAll();
            if (courses.isEmpty()) {
                log.warn("No courses found, skipping course content initialization");
                return;
            }

            int totalModules = 0;
            int totalLessons = 0;
            int totalQuizzes = 0;
            int coursesProcessed = 0;

            for (Course course : courses) {
                try {
                    // Check if course already has modules
                    long existingModuleCount = courseModuleRepository.countByCourseId(course.getId());
                    boolean shouldCreateModules = existingModuleCount == 0;
                    
                    if (shouldCreateModules) {
                        log.info("Creating content for course: {}", course.getTitle());
                        
                        // Create modules based on course category
                        List<CourseModule> modules = createModulesForCourse(course);
                        if (modules.isEmpty()) {
                            log.warn("No modules created for course: {}", course.getTitle());
                        } else {
                            courseModuleRepository.saveAll(modules);
                            totalModules += modules.size();
                            log.info("Created {} modules for course: {}", modules.size(), course.getTitle());

                            // Create lessons for each module
                            for (CourseModule module : modules) {
                                try {
                                    List<Lesson> lessons = createLessonsForModule(module, course);
                                    if (!lessons.isEmpty()) {
                                        lessonRepository.saveAll(lessons);
                                        totalLessons += lessons.size();
                                        log.info("Created {} lessons for module: {} in course: {}", 
                                                lessons.size(), module.getTitle(), course.getTitle());
                                    } else {
                                        log.warn("No lessons created for module: {} in course: {}", 
                                                module.getTitle(), course.getTitle());
                                    }
                                } catch (Exception e) {
                                    log.error("Error creating lessons for module {} in course {}: {}", 
                                            module.getTitle(), course.getTitle(), e.getMessage(), e);
                                }
                            }
                        }
                    } else {
                        log.info("Course '{}' already has {} modules. Updating content...", 
                                course.getTitle(), existingModuleCount);
                        
                        // Fetch existing modules with lessons
                        List<CourseModule> existingModules = courseModuleRepository.findModulesWithLessonsByCourseId(course.getId());
                        
                        for (CourseModule module : existingModules) {
                            if (module.getLessons() != null) {
                                for (Lesson lesson : module.getLessons()) {
                                    // Skip quiz lessons for content update
                                    if (lesson.getType() == Lesson.LessonType.QUIZ) continue;
                                    
                                    // Update content
                                    String newContent = getLessonContent(course, module.getTitle(), lesson.getOrderIndex());
                                    // Don't overwrite if not meaningful change, but here we force update for "rich text"
                                    if (newContent != null && !newContent.isEmpty()) {
                                        lesson.setContent(newContent);
                                        // Ensure type is TEXT if we want text-first experience, or VIDEO if it has video
                                        // User asked for text content, so let's ensure it's presented well.
                                        // We can keep type as VIDEO if videoUrl exists, but the content field will now be rich.
                                        // Or switch to TEXT to force frontend to show text primarily?
                                        // Let's keep existing type logic but update content.
                                        // Actually user said "instead of waiting for video link", implying they want to READ.
                                        // So maybe set type to LEssonType.TEXT?
                                        // Let's set to TEXT for basic content to ensure it's readable.
                                        if (lesson.getType() == Lesson.LessonType.VIDEO && (lesson.getVideoUrl() == null || lesson.getVideoUrl().contains("example.com"))) {
                                            lesson.setType(Lesson.LessonType.TEXT);
                                        }
                                    }
                                }
                                lessonRepository.saveAll(module.getLessons());
                                log.info("Updated content for module: {}", module.getTitle());
                            }
                        }
                    }

                    // Create final quiz for course (10-15 questions)
                    try {
                        // Check if quiz already exists
                        List<Quiz> existingQuizzes = quizRepository.findByCourseId(course.getId());
                        Quiz existingQuiz = existingQuizzes.isEmpty() ? null : existingQuizzes.get(0);
                        if (existingQuiz == null) {
                            Quiz quiz = createCourseQuiz(course);
                            if (quiz != null) {
                                quizRepository.save(quiz);
                                totalQuizzes++;
                                
                                // Create quiz questions
                                List<QuizQuestion> questions = createQuizQuestions(quiz, course);
                                if (!questions.isEmpty()) {
                                    quizQuestionRepository.saveAll(questions);
                                    log.info("Created quiz with {} questions for course: {}", 
                                            questions.size(), course.getTitle());
                                }
                            }
                        } else {
                            // Quiz exists, check if it has enough questions (should have 12)
                            List<QuizQuestion> existingQuestions = quizQuestionRepository.findByQuizId(existingQuiz.getId());
                            int targetQuestionCount = 12;
                            
                            // Check if questions are generic (have "Câu hỏi X về" or "Đáp án A/B/C/D")
                            boolean hasGenericQuestions = existingQuestions.stream()
                                    .anyMatch(q -> {
                                        boolean hasGenericQuestion = q.getQuestion() != null && 
                                                (q.getQuestion().contains("Câu hỏi") && q.getQuestion().contains("về"));
                                        boolean hasGenericOptions = q.getOptions() != null && q.getOptions().stream()
                                                .anyMatch(opt -> opt != null && (opt.equals("Đáp án A") || opt.equals("Đáp án B") 
                                                        || opt.equals("Đáp án C") || opt.equals("Đáp án D")));
                                        return hasGenericQuestion || hasGenericOptions;
                                    });
                            
                            // For Spring Boot Microservices, ALWAYS recreate questions to ensure proper content
                            boolean isSpringBootMicroservices = course.getTitle().equals("Spring Boot Microservices");
                            
                            // Always recreate if: empty, generic, wrong count, or Spring Boot Microservices
                            if (existingQuestions.isEmpty() || hasGenericQuestions || existingQuestions.size() != targetQuestionCount || isSpringBootMicroservices) {
                                // Delete ALL existing questions
                                if (!existingQuestions.isEmpty()) {
                                    log.warn("=== DELETING {} EXISTING QUESTIONS FOR COURSE: {} ===", 
                                            existingQuestions.size(), course.getTitle());
                                    log.warn("Reason: isEmpty={}, hasGeneric={}, wrongCount={}, isSpringBoot={}", 
                                            existingQuestions.isEmpty(), hasGenericQuestions, 
                                            existingQuestions.size() != targetQuestionCount, isSpringBootMicroservices);
                                    quizQuestionRepository.deleteAll(existingQuestions);
                                    log.warn("Deleted all existing questions");
                                }
                                
                                // Create new questions with proper content
                                log.info("=== CREATING {} QUESTIONS WITH PROPER CONTENT FOR COURSE: {} ===", 
                                        targetQuestionCount, course.getTitle());
                                List<QuizQuestion> questions = createQuizQuestions(existingQuiz, course);
                                if (!questions.isEmpty()) {
                                    quizQuestionRepository.saveAll(questions);
                                    log.info("=== CREATED {} QUESTIONS WITH PROPER CONTENT ===", questions.size());
                                    // Log first 3 questions as samples
                                    for (int i = 0; i < Math.min(3, questions.size()); i++) {
                                        QuizQuestion q = questions.get(i);
                                        log.info("Sample question {}: '{}'", i + 1, q.getQuestion());
                                        log.info("  Options: {}", q.getOptions());
                                    }
                                } else {
                                    log.error("Failed to create questions for course: {}", course.getTitle());
                                }
                            } else if (existingQuestions.size() < targetQuestionCount) {
                                // Quiz has questions but not enough, create additional questions
                                int questionsNeeded = targetQuestionCount - existingQuestions.size();
                                log.info("Quiz exists for course {} but only has {} questions (need {}), creating {} more questions...", 
                                        course.getTitle(), existingQuestions.size(), targetQuestionCount, questionsNeeded);
                                
                                // Get the highest order index
                                int maxOrderIndex = existingQuestions.stream()
                                        .mapToInt(QuizQuestion::getOrderIndex)
                                        .max()
                                        .orElse(0);
                                
                                // Get existing question texts to avoid duplicates
                                java.util.Set<String> existingQuestionTexts = existingQuestions.stream()
                                        .map(QuizQuestion::getQuestion)
                                        .collect(java.util.stream.Collectors.toSet());
                                
                                // Create all possible questions for this course
                                List<QuizQuestion> allPossibleQuestions = createQuizQuestions(existingQuiz, course);
                                
                                // Filter out questions that already exist and take only what we need
                                List<QuizQuestion> additionalQuestions = allPossibleQuestions.stream()
                                        .filter(q -> !existingQuestionTexts.contains(q.getQuestion()))
                                        .limit(questionsNeeded)
                                        .collect(java.util.stream.Collectors.toList());
                                
                                // Adjust order index for new questions
                                for (int i = 0; i < additionalQuestions.size(); i++) {
                                    additionalQuestions.get(i).setOrderIndex(maxOrderIndex + i + 1);
                                }
                                
                                if (!additionalQuestions.isEmpty()) {
                                    quizQuestionRepository.saveAll(additionalQuestions);
                                    log.info("Created {} additional questions for existing quiz in course: {} (total: {})", 
                                            additionalQuestions.size(), course.getTitle(), 
                                            existingQuestions.size() + additionalQuestions.size());
                                } else {
                                    log.warn("Could not create additional questions for course {} - all possible questions may already exist. Current: {}, Target: {}", 
                                            course.getTitle(), existingQuestions.size(), targetQuestionCount);
                                }
                            } else {
                                // Always check and recreate questions to ensure they have proper content
                                // Check if questions are generic (have "Câu hỏi X về" or "Đáp án A/B/C/D")
                                boolean hasGenericQuestionsCheck = existingQuestions.stream()
                                        .anyMatch(q -> {
                                            boolean hasGenericQuestion = q.getQuestion() != null && 
                                                    (q.getQuestion().contains("Câu hỏi") && q.getQuestion().contains("về"));
                                            boolean hasGenericOptions = q.getOptions() != null && q.getOptions().stream()
                                                    .anyMatch(opt -> opt != null && (opt.equals("Đáp án A") || opt.equals("Đáp án B") 
                                                            || opt.equals("Đáp án C") || opt.equals("Đáp án D")));
                                            return hasGenericQuestion || hasGenericOptions;
                                        });
                                
                                if (hasGenericQuestionsCheck || existingQuestions.size() != targetQuestionCount) {
                                    // Delete all existing questions and create new ones with proper content
                                    log.info("Found generic or incorrect questions for course {} (hasGeneric: {}, count: {}), deleting and recreating...", 
                                            course.getTitle(), hasGenericQuestionsCheck, existingQuestions.size());
                                    quizQuestionRepository.deleteAll(existingQuestions);
                                    
                                    // Create new questions with proper content
                                    List<QuizQuestion> questions = createQuizQuestions(existingQuiz, course);
                                    if (!questions.isEmpty()) {
                                        quizQuestionRepository.saveAll(questions);
                                        log.info("Recreated {} questions with proper content for course: {}", 
                                                questions.size(), course.getTitle());
                                        // Log first question as sample
                                        if (!questions.isEmpty()) {
                                            QuizQuestion firstQ = questions.get(0);
                                            log.info("Sample question: '{}' with options: {}", 
                                                    firstQ.getQuestion(), firstQ.getOptions());
                                        }
                                    }
                                } else {
                                    log.debug("Quiz already exists with {} proper questions for course: {}", 
                                            existingQuestions.size(), course.getTitle());
                                }
                            }
                        }
                    } catch (Exception e) {
                        log.error("Error creating quiz for course {}: {}", course.getTitle(), e.getMessage(), e);
                    }
                    
                    coursesProcessed++;
                } catch (Exception e) {
                    log.error("Error initializing content for course {}: {}", course.getTitle(), e.getMessage(), e);
                }
            }

            log.info("Successfully initialized course content: {} courses processed, {} modules, {} lessons, {} quizzes", 
                    coursesProcessed, totalModules, totalLessons, totalQuizzes);
        } catch (Exception e) {
            log.error("Error in initCourseContent: {}", e.getMessage(), e);
            // Don't throw exception to prevent service startup failure
        }
    }

    private List<CourseModule> createModulesForCourse(Course course) {
        List<CourseModule> modules = new java.util.ArrayList<>();
        
        // Create 3-4 modules per course based on category
        String category = course.getCategory();
        String title = course.getTitle();
        
        if (title.contains("Java") || title.contains("Python") || title.contains("JavaScript") || 
            title.contains("React") || title.contains("Node") || title.contains("Vue") ||
            title.contains("TypeScript") || title.contains("Django") || title.contains("Spring")) {
            // Programming courses
            modules.add(CourseModule.builder()
                    .course(course)
                    .title("Giới thiệu và Cài đặt")
                    .description("Tìm hiểu về công nghệ và cách cài đặt môi trường phát triển")
                    .orderIndex(1)
                    .build());
            modules.add(CourseModule.builder()
                    .course(course)
                    .title("Kiến thức Cơ bản")
                    .description("Nắm vững các khái niệm và cú pháp cơ bản")
                    .orderIndex(2)
                    .build());
            modules.add(CourseModule.builder()
                    .course(course)
                    .title("Thực hành Nâng cao")
                    .description("Áp dụng kiến thức vào các dự án thực tế")
                    .orderIndex(3)
                    .build());
            modules.add(CourseModule.builder()
                    .course(course)
                    .title("Bài kiểm tra cuối khóa")
                    .description("Đánh giá kiến thức đã học")
                    .orderIndex(4)
                    .build());
        } else {
            // Other courses (CAREER, SOFT_SKILLS, etc.)
            modules.add(CourseModule.builder()
                    .course(course)
                    .title("Tổng quan")
                    .description("Giới thiệu về chủ đề và mục tiêu học tập")
                    .orderIndex(1)
                    .build());
            modules.add(CourseModule.builder()
                    .course(course)
                    .title("Nội dung Chính")
                    .description("Các kiến thức và kỹ năng cần thiết")
                    .orderIndex(2)
                    .build());
            modules.add(CourseModule.builder()
                    .course(course)
                    .title("Áp dụng Thực tế")
                    .description("Thực hành và áp dụng kiến thức")
                    .orderIndex(3)
                    .build());
        }

        return modules;
    }

    private List<Lesson> createLessonsForModule(CourseModule module, Course course) {
        List<Lesson> lessons = new java.util.ArrayList<>();
        String moduleTitle = module.getTitle();
        int moduleOrder = module.getOrderIndex();
        
        if (moduleTitle.contains("Bài kiểm tra")) {
            // Final quiz module - create a QUIZ lesson
            Lesson quizLesson = Lesson.builder()
                    .module(module)
                    .title("Bài kiểm tra cuối khóa")
                    .description("Hoàn thành bài kiểm tra để đánh giá kiến thức đã học")
                    .type(Lesson.LessonType.QUIZ)
                    .content("{\"quizId\": \"" + course.getId() + "\"}")
                    .orderIndex(1)
                    .durationMinutes(30)
                    .isPreview(false)
                    .build();
            lessons.add(quizLesson);
        } else {
            // Regular lessons - create 2-3 lessons per module
            int lessonCount = moduleOrder == 1 ? 2 : 3;
            for (int i = 1; i <= lessonCount; i++) {
                String lessonTitle = getLessonTitle(moduleTitle, i);
                String lessonContent = getLessonContent(course, moduleTitle, i);
                
                Lesson lesson = Lesson.builder()
                        .module(module)
                        .title(lessonTitle)
                        .description("Bài học " + i + " trong module " + moduleTitle)
                        .type(i == 1 && moduleOrder == 1 ? Lesson.LessonType.VIDEO : Lesson.LessonType.TEXT)
                        .content(lessonContent)
                        .videoUrl(i == 1 && moduleOrder == 1 ? "https://example.com/video/" + course.getId() : null)
                        .orderIndex(i)
                        .durationMinutes(15 + i * 5)
                        .isPreview(i == 1 && moduleOrder == 1)
                        .build();
                lessons.add(lesson);
            }
        }

        return lessons;
    }

    private String getLessonTitle(String moduleTitle, int lessonNum) {
        if (moduleTitle.contains("Giới thiệu")) {
            return lessonNum == 1 ? "Tổng quan về công nghệ" : "Cài đặt môi trường";
        } else if (moduleTitle.contains("Cơ bản")) {
            return "Kiến thức cơ bản - Phần " + lessonNum;
        } else if (moduleTitle.contains("Nâng cao")) {
            return "Thực hành nâng cao - Phần " + lessonNum;
        } else if (moduleTitle.contains("Tổng quan")) {
            return "Giới thiệu chủ đề";
        } else if (moduleTitle.contains("Chính")) {
            return "Nội dung chính - Phần " + lessonNum;
        } else if (moduleTitle.contains("Thực tế")) {
            return "Áp dụng thực tế - Phần " + lessonNum;
        }
        return "Bài học " + lessonNum;
    }

    private String getLessonContent(Course course, String moduleTitle, int lessonNum) {
        String courseTitle = course.getTitle();
        String category = course.getCategory();
        StringBuilder content = new StringBuilder();
        
        content.append("<div class='lesson-content' style='max-width: 900px; margin: 0 auto; padding: 20px; line-height: 1.8; font-family: Inter, system-ui, sans-serif; color: #1f2937;'>");
        
        // Generate real content based on course title and module
        if (moduleTitle.contains("Giới thiệu") || moduleTitle.contains("Tổng quan")) {
            content.append(getIntroductionContent(courseTitle, category, lessonNum));
        } else if (moduleTitle.contains("Cơ bản") || moduleTitle.contains("Chính")) {
            content.append(getBasicContent(courseTitle, category, lessonNum));
        } else if (moduleTitle.contains("Nâng cao") || moduleTitle.contains("Thực tế")) {
            content.append(getAdvancedContent(courseTitle, category, lessonNum));
        } else {
            content.append(getGeneralContent(courseTitle, category));
        }
        
        content.append("</div>");
        return content.toString();
    }

    private String getIntroductionContent(String courseTitle, String category, int lessonNum) {
        StringBuilder content = new StringBuilder();
        
        if (lessonNum == 1) {
            content.append("<div class='intro-section'>");
            content.append("<h2>Chào mừng bạn đến với khóa học ").append(courseTitle).append("</h2>");
            content.append("<p>Khóa học này được thiết kế để đưa bạn từ người mới bắt đầu trở thành chuyên gia. Chúng ta sẽ cùng nhau khám phá các khái niệm cốt lõi, thực hành qua các dự án thực tế và xây dựng nền tảng vững chắc cho sự nghiệp của bạn.</p>");
            content.append("</div>");

            if (category.equals("TECHNICAL")) {
                if (courseTitle.contains("Java")) {
                    content.append("<h3>Tại sao nên học Java?</h3>");
                    content.append("<p>Java không chỉ là một ngôn ngữ lập trình, nó là nền tảng của hàng tỷ thiết bị trên toàn thế giới.</p>");
                    content.append("<ul class='grid-list'>");
                    content.append("<li><strong class='text-highlight'>🎯 Phổ biến toàn cầu</strong>Được sử dụng bởi 90% các công ty trong Fortune 500 cho hệ thống backend.</li>");
                    content.append("<li><strong class='text-highlight'>🔒 Mạnh mẽ & Bảo mật</strong>Hệ thống kiểu dữ liệu tĩnh mạnh và quản lý bộ nhớ tự động giúp code an toàn hơn.</li>");
                    content.append("<li><strong class='text-highlight'>📱 Đa nền tảng</strong>\"Write Once, Run Anywhere\" - Chạy trên mọi hệ điều hành mà không cần biên dịch lại.</li>");
                    content.append("</ul>");
                } else if (courseTitle.contains("Python")) {
                    content.append("<h3>Sức mạnh của Python</h3>");
                    content.append("<p>Python là ngôn ngữ phát triển nhanh nhất hiện nay, thống trị lĩnh vực AI và Data Science.</p>");
                    content.append("<div class='info-box'>");
                    content.append("<p>\"Python đơn giản như tiếng Anh, nhưng mạnh mẽ như C++.\"</p>");
                    content.append("</div>");
                    content.append("<p>Bạn có thể làm gì với Python?</p>");
                    content.append("<ul>");
                    content.append("<li>🤖 <strong>Trí tuệ nhân tạo (AI):</strong> TensorFlow, PyTorch</li>");
                    content.append("<li>📊 <strong>Khoa học dữ liệu:</strong> Phân tích và trực quan hóa dữ liệu lớn</li>");
                    content.append("<li>🌐 <strong>Web Development:</strong> Django, Flask, FastAPI</li>");
                    content.append("<li>⚙️ <strong>Tự động hóa:</strong> Scripting và DevOps</li>");
                    content.append("</ul>");
                }
            } else if (category.equals("CV")) {
                content.append("<h3>CV: Vũ khí bí mật của bạn</h3>");
                content.append("<p>Một chiếc CV tốt không phải là liệt kê tất cả những gì bạn đã làm. Đó là nghệ thuật <strong>bán kỹ năng</strong> của bạn cho nhà tuyển dụng.</p>");
                content.append("<div class='grid-2'>");
                content.append("<div class='card error'><strong>❌ Sai lầm phổ biến:</strong> CV quá dài dòng, lỗi chính tả, không tập trung vào kết quả.</div>");
                content.append("<div class='card success'><strong>✅ Mục tiêu khóa học:</strong> Tạo ra bản CV \"6 giây\" - vượt qua vòng lọc hồ sơ ngay lập tức.</div>");
                content.append("</div>");
            }
        } else {
            content.append("<h3>Thiết lập môi trường & Công cụ</h3>");
            content.append("<p>Để bắt đầu hành trình này, chúng ta cần chuẩn bị những công cụ tốt nhất. Đừng lo, tôi sẽ hướng dẫn bạn từng bước.</p>");
            content.append("<div class='box'>");
            content.append("<h4>🛠 Checklist cài đặt:</h4>");
            content.append("<ul>");
            content.append("<li><input type='checkbox' checked disabled> <strong>IDE/Code Editor:</strong> VS Code hoặc IntelliJ IDEA</li>");
            content.append("<li><input type='checkbox' disabled> <strong>Runtime/SDK:</strong> JDK 17+ (cho Java) hoặc Python 3.10+</li>");
            content.append("<li><input type='checkbox' disabled> <strong>Version Control:</strong> Git & GitHub Account</li>");
            content.append("</ul>");
            content.append("</div>");
            content.append("<p class='tip'>💡 <em>Mẹo: Hãy đảm bảo đường truyền internet ổn định khi tải các bộ cài đặt nặng.</em></p>");
        }
        
        return content.toString();
    }

    private String getBasicContent(String courseTitle, String category, int lessonNum) {
        StringBuilder content = new StringBuilder();
        
        if (category.equals("TECHNICAL")) {
            if (courseTitle.contains("Java")) {
                if (lessonNum == 1) { // Variables & Data Types
                    content.append("<h3 style='color: #2563eb;'>Biến & Kiểu dữ liệu: Nền tảng của Java</h3>");
                    content.append("<p>Trong Java, mọi biến đều cần một \"danh phận\" rõ ràng. Đây là đặc điểm của ngôn ngữ <strong>Strongly Typed</strong>.</p>");
                    
                    content.append("<h4>1. Các kiểu dữ liệu nguyên thủy (Primitive Types)</h4>");
                    content.append("<table style='width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;'>");
                    content.append("<tr style='background: #f3f4f6;'><th style='padding: 10px; border: 1px solid #e5e7eb;'>Kiểu</th><th style='padding: 10px; border: 1px solid #e5e7eb;'>Kích thước</th><th style='padding: 10px; border: 1px solid #e5e7eb;'>Ví dụ</th><th style='padding: 10px; border: 1px solid #e5e7eb;'>Mô tả</th></tr>");
                    content.append("<tr><td style='padding: 10px; border: 1px solid #e5e7eb;'><code>int</code></td><td style='padding: 10px; border: 1px solid #e5e7eb;'>4 bytes</td><td style='padding: 10px; border: 1px solid #e5e7eb;'><code>int age = 25;</code></td><td style='padding: 10px; border: 1px solid #e5e7eb;'>Số nguyên thông dụng nhất</td></tr>");
                    content.append("<tr><td style='padding: 10px; border: 1px solid #e5e7eb;'><code>double</code></td><td style='padding: 10px; border: 1px solid #e5e7eb;'>8 bytes</td><td style='padding: 10px; border: 1px solid #e5e7eb;'><code>double pi = 3.14;</code></td><td style='padding: 10px; border: 1px solid #e5e7eb;'>Số thực có độ chính xác cao</td></tr>");
                    content.append("<tr><td style='padding: 10px; border: 1px solid #e5e7eb;'><code>boolean</code></td><td style='padding: 10px; border: 1px solid #e5e7eb;'>1 bit</td><td style='padding: 10px; border: 1px solid #e5e7eb;'><code>boolean isJavaFun = true;</code></td><td style='padding: 10px; border: 1px solid #e5e7eb;'>Đúng hoặc Sai</td></tr>");
                    content.append("</table>");
                    
                    content.append("<h4>2. Ví dụ thực tế</h4>");
                    content.append("<pre style='background: #1e293b; color: #e2e8f0; padding: 20px; border-radius: 8px; font-family: monospace; overflow-x: auto;'><code>public class UserProfile {\n    public static void main(String[] args) {\n        // Khai báo thông tin user\n        String fullName = \"Nguyễn Văn A\";\n        int age = 22;\n        double gpa = 3.8;\n        boolean isGraduated = false;\n\n        System.out.println(\"Hồ sơ sinh viên: \" + fullName);\n        System.out.println(\"Điểm GPA: \" + gpa);\n        \n        // Type casting (Ép kiểu)\n        int roundedGpa = (int) gpa; // Ép kiểu tường minh: 3.8 -> 3\n        System.out.println(\"Điểm làm tròn: \" + roundedGpa);\n    }\n}</code></pre>");
                } else { // Control Flow
                    content.append("<h3 style='color: #2563eb;'>Điều hướng luồng chương trình (Control Flow)</h3>");
                    content.append("<p>Lập trình không chỉ là chạy code từ trên xuống dưới. Bạn cần ra quyết định (<code>if-else</code>) và lặp lại công việc (<code>loops</code>).</p>");
                    
                    content.append("<div style='background: #eff6ff; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0;'>");
                    content.append("<strong>💡 Pro Tip:</strong> Luôn sử dụng dấu ngoặc nhọn <code>{}</code> ngay cả khi chỉ có một dòng lệnh trong if/else để tránh lỗi logic sau này.");
                    content.append("</div>");
                    
                    content.append("<h4>Vòng lặp For vs While</h4>");
                    content.append("<p>Khi nào dùng cái nào?</p>");
                    content.append("<ul>");
                    content.append("<li><strong>For Loop:</strong> Khi bạn biết trước số lần lặp (ví dụ: duyệt qua mảng kích thước 10).</li>");
                    content.append("<li><strong>While Loop:</strong> Khi bạn lặp dựa trên một điều kiện chưa biết trước thời điểm dừng (ví dụ: đọc file đến khi hết dòng).</li>");
                    content.append("</ul>");
                }
            } else if (courseTitle.contains("Python")) {
                if (lessonNum == 1) {
                    content.append("<h3 style='color: #16a34a;'>Biến & Kiểu dữ liệu: Sự linh hoạt của Python</h3>");
                    content.append("<p>Python là ngôn ngữ <strong>Dynamically Typed</strong>. Bạn không cần khai báo kiểu, Python sẽ tự hiểu.</p>");
                    
                    content.append("<h4>Data Structures cốt lõi</h4>");
                    content.append("<div style='display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0;'>");
                    content.append("<div style='background: #f9fafb; padding: 15px; border-radius: 8px;'><h5>📌 List (Danh sách)</h5><code>items = [1, \"apple\", True]</code><p style='font-size: 13px; color: #666;'>Có thứ tự, thay đổi được.</p></div>");
                    content.append("<div style='background: #f9fafb; padding: 15px; border-radius: 8px;'><h5>📌 Tuple</h5><code>coords = (10, 20)</code><p style='font-size: 13px; color: #666;'>Có thứ tự, <strong>không</strong> đổi được.</p></div>");
                    content.append("<div style='background: #f9fafb; padding: 15px; border-radius: 8px;'><h5>📌 Dictionary (Từ điển)</h5><code>user = {\"name\": \"Nam\", \"age\": 25}</code><p style='font-size: 13px; color: #666;'>Key-Value pair, tra cứu cực nhanh.</p></div>");
                    content.append("<div style='background: #f9fafb; padding: 15px; border-radius: 8px;'><h5>📌 Set (Tập hợp)</h5><code>unique = {1, 2, 3}</code><p style='font-size: 13px; color: #666;'>Không trùng lặp, không thứ tự.</p></div>");
                    content.append("</div>");
                } else {
                    content.append("<h3 style='color: #16a34a;'>List Comprehensions - Pythonic Way</h3>");
                    content.append("<p>Đây là tính năng \"đặc sản\" của Python giúp code ngắn gọn và dễ đọc hơn.</p>");
                    content.append("<pre style='background: #1e293b; color: #e2e8f0; padding: 20px; border-radius: 8px; font-family: monospace;'><code># Cách thông thường\nsquares = []\nfor x in range(10):\n    squares.append(x**2)\n\n# Cách Pythonic (List Comp)\nsquares = [x**2 for x in range(10)]\n\n# Kết hợp điều kiện\nevens = [x for x in range(10) if x % 2 == 0]</code></pre>");
                }
            } else {
                content.append("<h3>Nền tảng kiến thức</h3>");
                content.append("<p>Hãy bắt đầu xây dựng những viên gạch đầu tiên. Kiến thức cơ bản vững chắc sẽ giúp bạn tiến xa hơn.</p>");
            }
        } else if (category.equals("CV")) {
             content.append("<h3 style='color: #d97706;'>Cấu trúc chuẩn của một CV chuyên nghiệp</h3>");
             content.append("<p>Đừng để nhà tuyển dụng phải \"truy tìm kho báu\" thông tin của bạn. Hãy sắp xếp nó thật khoa học.</p>");
             content.append("<div style='border-left: 4px solid #d97706; padding-left: 20px; margin: 20px 0;'>");
             content.append("<h4>1. Thông tin liên hệ (Contact Info)</h4>");
             content.append("<p>Họ tên, Email (chuyên nghiệp), Số điện thoại, Link LinkedIn. <em>Không cần địa chỉ nhà cụ thể, chỉ cần Quận/Thành phố.</em></p>");
             content.append("<h4>2. Tóm tắt chuyên môn (Professional Summary)</h4>");
             content.append("<p>2-3 câu tóm tắt bạn là ai, kinh nghiệm cốt lõi và giá trị bạn mang lại.</p>");
             content.append("<h4>3. Kinh nghiệm làm việc (Work Experience)</h4>");
             content.append("<p>Liệt kê ngược thời gian (mới nhất trước). Dùng bullet points và động từ mạnh (Developed, Managed, Created).</p>");
             content.append("<h4>4. Kỹ năng (Skills)</h4>");
             content.append("<p>Chia thành Hard Skills (Kỹ thuật) và Soft Skills (Mềm).</p>");
             content.append("</div>");
        }
        
        return content.toString();
    }
    
    private String getAdvancedContent(String courseTitle, String category, int lessonNum) {
        StringBuilder content = new StringBuilder();
        content.append("<div style='background: #fff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);'>");
        content.append("<h3 style='color: #4338ca; border-bottom: 2px solid #4338ca; padding-bottom: 10px; display: inline-block;'>Chuyên sâu & Thực chiến</h3>");
        
        if (category.equals("TECHNICAL")) {
             content.append("<p style='margin-top: 20px;'>Đã đến lúc nâng tầm code của bạn. Chúng ta không chỉ viết code chạy được, mà phải viết code <strong>sạch (clean), tối ưu (optimized) và dễ bảo trì (maintainable)</strong>.</p>");
             
             if (courseTitle.contains("Java") || courseTitle.contains("Spring")) {
                 content.append("<h4>Design Patterns: Singleton & Factory</h4>");
                 content.append("<p>Giải quyết các vấn đề thiết kế phổ biến bằng các mẫu chuẩn mực.</p>");
                 content.append("<pre style='background: #1e293b; color: #e2e8f0; padding: 15px; border-radius: 6px; font-size: 13px; overflow-x: auto;'><code>// Singleton Pattern (Lazy Initialization)\npublic class DatabaseConnection {\n    private static DatabaseConnection instance;\n    \n    private DatabaseConnection() {} // Private Constructor\n    \n    public static synchronized DatabaseConnection getInstance() {\n        if (instance == null) {\n            instance = new DatabaseConnection();\n        }\n        return instance;\n    }\n}</code></pre>");
             }
        }
        
        content.append("<div style='margin-top: 30px; background: #f0fdfa; padding: 15px; border-radius: 8px;'>");
        content.append("<strong style='color: #0d9488;'>🚀 Challenge:</strong>");
        content.append("<p style='margin: 10px 0 0;'>Hãy thử áp dụng kiến thức này vào dự án cá nhân của bạn ngay hôm nay. Đừng chỉ đọc, hãy code!</p>");
        content.append("</div>");
        content.append("</div>");
        return content.toString();
    }
    
    private String getGeneralContent(String courseTitle, String category) {
        return "<p>Nội dung đang được cập nhật chi tiết cho khóa học <strong>" + courseTitle + "</strong>. Vui lòng quay lại sau.</p>";
    }

    private Quiz createCourseQuiz(Course course) {
        // Create quiz with 12 questions (between 10-15)
        Quiz quiz = Quiz.builder()
                .title("Bài kiểm tra cuối khóa: " + course.getTitle())
                .description("Đánh giá kiến thức đã học trong khóa học")
                .category(course.getCategory())
                .type(Quiz.QuizType.TECHNICAL_TEST)
                .courseId(course.getId())
                .timeLimitMinutes(30)
                .totalQuestions(12)
                .passingScore(50) // 50% passing score
                .isActive(true)
                .build();
        return quiz;
    }

    private List<QuizQuestion> createQuizQuestions(Quiz quiz, Course course) {
        List<QuizQuestion> questions = new java.util.ArrayList<>();
        String courseTitle = course.getTitle();
        String category = course.getCategory();
        
        // Mapping cố định cho từng khóa học dựa trên title chính xác
        // TECHNICAL COURSES
        if (category.equals("TECHNICAL")) {
            if (courseTitle.equals("Java cơ bản cho người mới bắt đầu")) {
                questions.addAll(createJavaQuestions(quiz));
            } else if (courseTitle.equals("Java nâng cao và Spring Framework")) {
                questions.addAll(createJavaQuestions(quiz)); // Dùng Java questions
            } else if (courseTitle.equals("Spring Boot Microservices")) {
                questions.addAll(createSpringBootMicroservicesQuestions(quiz));
            } else if (courseTitle.equals("Python cơ bản")) {
                questions.addAll(createPythonQuestions(quiz));
            } else if (courseTitle.equals("Python nâng cao và Django")) {
                questions.addAll(createPythonQuestions(quiz)); // Dùng Python questions
            } else if (courseTitle.equals("Data Science với Python")) {
                questions.addAll(createPythonQuestions(quiz)); // Dùng Python questions
            } else if (courseTitle.equals("JavaScript cơ bản")) {
                questions.addAll(createJavaScriptQuestions(quiz));
            } else if (courseTitle.equals("React.js từ cơ bản đến nâng cao")) {
                questions.addAll(createJavaScriptQuestions(quiz)); // Dùng JavaScript/React questions
            } else if (courseTitle.equals("Node.js và Express.js")) {
                questions.addAll(createJavaScriptQuestions(quiz)); // Dùng JavaScript questions
            } else if (courseTitle.equals("Full Stack Development với MERN")) {
                questions.addAll(createJavaScriptQuestions(quiz)); // Dùng JavaScript questions
            } else if (courseTitle.equals("HTML, CSS và JavaScript cơ bản")) {
                questions.addAll(createJavaScriptQuestions(quiz)); // Dùng JavaScript questions
            } else if (courseTitle.equals("Vue.js Framework")) {
                questions.addAll(createJavaScriptQuestions(quiz)); // Dùng JavaScript questions
            } else if (courseTitle.equals("TypeScript cho JavaScript Developers")) {
                questions.addAll(createJavaScriptQuestions(quiz)); // Dùng JavaScript questions
            } else if (courseTitle.equals("Database Design và SQL")) {
                questions.addAll(createSQLQuestions(quiz));
            } else if (courseTitle.equals("Git và GitHub cho Developers")) {
                questions.addAll(createGitQuestions(quiz));
            } else if (courseTitle.equals("Docker và Containerization")) {
                questions.addAll(createDockerQuestions(quiz));
            } else if (courseTitle.equals("AWS Cloud Computing cơ bản")) {
                questions.addAll(createAWSQuestions(quiz));
            } else {
                // Fallback cho technical courses khác
                questions.addAll(createGenericTechQuestions(quiz, courseTitle));
            }
        } 
        // CV COURSES
        else if (category.equals("CV")) {
            if (courseTitle.equals("Kỹ năng viết CV chuyên nghiệp")) {
                questions.addAll(createCVQuestions(quiz));
            } else {
                questions.addAll(createCVQuestions(quiz)); // Fallback
            }
        } 
        // INTERVIEW COURSES
        else if (category.equals("INTERVIEW")) {
            if (courseTitle.equals("Chuẩn bị phỏng vấn xin việc")) {
                questions.addAll(createInterviewQuestions(quiz));
            } else {
                questions.addAll(createInterviewQuestions(quiz)); // Fallback
            }
        } 
        // CAREER COURSES
        else if (category.equals("CAREER")) {
            if (courseTitle.equals("Lập kế hoạch sự nghiệp 5 năm")) {
                questions.addAll(createCareerPlanningQuestions(quiz));
            } else if (courseTitle.equals("Xây dựng thương hiệu cá nhân")) {
                questions.addAll(createPersonalBrandingQuestions(quiz));
            } else if (courseTitle.equals("Nghệ thuật đàm phán lương")) {
                questions.addAll(createNegotiationQuestions(quiz));
            } else {
                questions.addAll(createGenericQuestions(quiz, courseTitle));
            }
        }
        // SKILL COURSES
        else if (category.equals("SKILL")) {
            if (courseTitle.equals("Kỹ năng giao tiếp trong công việc")) {
                questions.addAll(createCommunicationQuestions(quiz));
            } else if (courseTitle.equals("Kỹ năng quản lý thời gian")) {
                questions.addAll(createTimeManagementQuestions(quiz));
            } else if (courseTitle.equals("Kỹ năng làm việc nhóm hiệu quả")) {
                questions.addAll(createTeamworkQuestions(quiz));
            } else {
                questions.addAll(createGenericQuestions(quiz, courseTitle));
            }
        }
        // OTHER COURSES
        else {
            questions.addAll(createGenericQuestions(quiz, courseTitle));
        }
        
        // Ensure we have exactly 12 questions
        while (questions.size() < 12) {
            questions.add(createGenericQuestion(quiz, questions.size() + 1, courseTitle));
        }
        if (questions.size() > 12) {
            questions = questions.subList(0, 12);
        }
        
        return questions;
    }

    private List<QuizQuestion> createJavaQuestions(Quiz quiz) {
        List<QuizQuestion> questions = new java.util.ArrayList<>();
        
        questions.add(createQuestion(quiz, 1, 
            "Java là ngôn ngữ lập trình gì?",
            Arrays.asList("Hướng đối tượng", "Hướng thủ tục", "Hướng chức năng", "Tất cả đều đúng"),
            0));
        
        questions.add(createQuestion(quiz, 2,
            "Cách khai báo biến nào đúng trong Java?",
            Arrays.asList("int x = 10;", "var x = 10;", "x = 10;", "int x; x = 10;"),
            0)); // int x = 10; là cách phổ biến và đúng nhất
        
        questions.add(createQuestion(quiz, 3,
            "Từ khóa nào dùng để kế thừa class trong Java?",
            Arrays.asList("extends", "implements", "inherits", "super"),
            0));
        
        questions.add(createQuestion(quiz, 4,
            "Phương thức main() trong Java có kiểu trả về là gì?",
            Arrays.asList("void", "int", "String", "Object"),
            0));
        
        questions.add(createQuestion(quiz, 5,
            "Interface trong Java (từ Java 8+) có thể chứa gì?",
            Arrays.asList("Method signatures, default methods, static methods", "Chỉ method signatures", "Biến instance", "Constructor"),
            0)); // Từ Java 8, interface có thể có default và static methods
        
        questions.add(createQuestion(quiz, 6,
            "Từ khóa 'final' trong Java có thể dùng với gì?",
            Arrays.asList("Class, method, variable", "Chỉ class", "Chỉ method", "Chỉ variable"),
            0));
        
        questions.add(createQuestion(quiz, 7,
            "Collection nào trong Java không cho phép duplicate?",
            Arrays.asList("Set", "List", "Map", "Array"),
            0));
        
        questions.add(createQuestion(quiz, 8,
            "Exception nào là checked exception trong Java?",
            Arrays.asList("IOException", "RuntimeException", "NullPointerException", "ArrayIndexOutOfBoundsException"),
            0));
        
        questions.add(createQuestion(quiz, 9,
            "Lambda expression được giới thiệu từ Java version nào?",
            Arrays.asList("Java 8", "Java 7", "Java 9", "Java 10"),
            0));
        
        questions.add(createQuestion(quiz, 10,
            "Stream API trong Java dùng để làm gì?",
            Arrays.asList("Xử lý collections", "Tạo thread", "Kết nối database", "Tạo GUI"),
            0));
        
        questions.add(createQuestion(quiz, 11,
            "Spring Framework là gì?",
            Arrays.asList("Framework cho Java enterprise", "Ngôn ngữ lập trình", "Database", "IDE"),
            0));
        
        questions.add(createQuestion(quiz, 12,
            "Annotation @Autowired trong Spring dùng để làm gì?",
            Arrays.asList("Dependency injection", "Tạo bean", "Cấu hình", "Validation"),
            0));
        
        return questions;
    }

    private List<QuizQuestion> createPythonQuestions(Quiz quiz) {
        List<QuizQuestion> questions = new java.util.ArrayList<>();
        
        questions.add(createQuestion(quiz, 1,
            "Python là ngôn ngữ lập trình gì?",
            Arrays.asList("Interpreted, high-level", "Compiled, low-level", "Assembly", "Machine code"),
            0));
        
        questions.add(createQuestion(quiz, 2,
            "Cách nào đúng để tạo list trong Python?",
            Arrays.asList("numbers = [1, 2, 3]", "numbers = (1, 2, 3)", "numbers = {1, 2, 3}", "numbers = 1, 2, 3"),
            0));
        
        questions.add(createQuestion(quiz, 3,
            "Dictionary trong Python được tạo bằng cách nào?",
            Arrays.asList("{}", "[]", "()", "set()"),
            0));
        
        questions.add(createQuestion(quiz, 4,
            "List comprehension trong Python có cú pháp nào?",
            Arrays.asList("[x for x in range(10)]", "for x in range(10)", "x = range(10)", "list(range(10))"),
            0));
        
        questions.add(createQuestion(quiz, 5,
            "Django là gì?",
            Arrays.asList("Web framework cho Python", "Database", "IDE", "Package manager"),
            0));
        
        questions.add(createQuestion(quiz, 6,
            "Decorator trong Python được ký hiệu bằng gì?",
            Arrays.asList("@", "#", "$", "%"),
            0));
        
        questions.add(createQuestion(quiz, 7,
            "Module nào dùng để làm việc với JSON trong Python?",
            Arrays.asList("json", "xml", "csv", "yaml"),
            0));
        
        questions.add(createQuestion(quiz, 8,
            "Pandas chủ yếu dùng để làm gì?",
            Arrays.asList("Phân tích dữ liệu", "Web development", "Game development", "Mobile apps"),
            0));
        
        questions.add(createQuestion(quiz, 9,
            "Virtual environment trong Python tạo bằng lệnh nào?",
            Arrays.asList("python -m venv", "python create venv", "pip install venv", "python venv"),
            0));
        
        questions.add(createQuestion(quiz, 10,
            "Generator trong Python dùng từ khóa nào?",
            Arrays.asList("yield", "return", "break", "continue"),
            0));
        
        questions.add(createQuestion(quiz, 11,
            "NumPy chủ yếu dùng để làm gì?",
            Arrays.asList("Tính toán số học với arrays", "Web scraping", "GUI development", "Networking"),
            0));
        
        questions.add(createQuestion(quiz, 12,
            "Flask là gì?",
            Arrays.asList("Micro web framework", "Database ORM", "Template engine", "Testing framework"),
            0));
        
        return questions;
    }

    private List<QuizQuestion> createJavaScriptQuestions(Quiz quiz) {
        List<QuizQuestion> questions = new java.util.ArrayList<>();
        
        questions.add(createQuestion(quiz, 1,
            "JavaScript là ngôn ngữ gì?",
            Arrays.asList("Dynamic, interpreted", "Static, compiled", "Assembly", "Machine code"),
            0));
        
        questions.add(createQuestion(quiz, 2,
            "Cách nào đúng để khai báo biến trong ES6?",
            Arrays.asList("let và const", "chỉ var", "chỉ let", "chỉ const"),
            0));
        
        questions.add(createQuestion(quiz, 3,
            "Arrow function có cú pháp nào?",
            Arrays.asList("() => {}", "function() {}", "=> function()", "() function {}"),
            0));
        
        questions.add(createQuestion(quiz, 4,
            "React là gì?",
            Arrays.asList("JavaScript library cho UI", "Framework backend", "Database", "Programming language"),
            0));
        
        questions.add(createQuestion(quiz, 5,
            "Hook nào dùng để quản lý state trong React?",
            Arrays.asList("useState", "useEffect", "useContext", "useReducer"),
            0));
        
        questions.add(createQuestion(quiz, 6,
            "Props trong React là gì?",
            Arrays.asList("Dữ liệu truyền từ component cha", "State của component", "Method của component", "Lifecycle hook"),
            0));
        
        questions.add(createQuestion(quiz, 7,
            "Node.js là gì?",
            Arrays.asList("JavaScript runtime trên server", "Frontend framework", "Database", "IDE"),
            0));
        
        questions.add(createQuestion(quiz, 8,
            "Promise trong JavaScript dùng để làm gì?",
            Arrays.asList("Xử lý async operations", "Tạo loops", "Define functions", "Create objects"),
            0));
        
        questions.add(createQuestion(quiz, 9,
            "async/await trong JavaScript dùng để làm gì?",
            Arrays.asList("Xử lý asynchronous code", "Tạo classes", "Import modules", "Export functions"),
            0));
        
        questions.add(createQuestion(quiz, 10,
            "DOM là viết tắt của gì?",
            Arrays.asList("Document Object Model", "Data Object Model", "Document Oriented Model", "Dynamic Object Model"),
            0));
        
        questions.add(createQuestion(quiz, 11,
            "Event loop trong JavaScript dùng để làm gì?",
            Arrays.asList("Xử lý asynchronous operations", "Tạo loops", "Parse JSON", "Validate forms"),
            0));
        
        questions.add(createQuestion(quiz, 12,
            "Closure trong JavaScript là gì?",
            Arrays.asList("Function có access đến outer scope", "Class trong ES6", "Module system", "Import statement"),
            0));
        
        return questions;
    }

    private List<QuizQuestion> createCVQuestions(Quiz quiz) {
        List<QuizQuestion> questions = new java.util.ArrayList<>();
        
        questions.add(createQuestion(quiz, 1,
            "CV nên dài bao nhiêu trang?",
            Arrays.asList("1-2 trang", "3-4 trang", "5-6 trang", "Không giới hạn"),
            0));
        
        questions.add(createQuestion(quiz, 2,
            "Phần nào quan trọng nhất trong CV?",
            Arrays.asList("Kinh nghiệm làm việc", "Ảnh đại diện", "Sở thích", "Thông tin liên hệ"),
            0));
        
        questions.add(createQuestion(quiz, 3,
            "Nên dùng font chữ nào trong CV?",
            Arrays.asList("Font chuyên nghiệp, dễ đọc", "Font nghệ thuật", "Font viết tay", "Font tùy ý"),
            0));
        
        questions.add(createQuestion(quiz, 4,
            "Nên liệt kê bao nhiêu kỹ năng trong CV?",
            Arrays.asList("5-10 kỹ năng liên quan", "Càng nhiều càng tốt", "Chỉ 1-2 kỹ năng", "Không cần liệt kê"),
            0));
        
        questions.add(createQuestion(quiz, 5,
            "Nên gửi CV dưới định dạng nào?",
            Arrays.asList("PDF", "Word", "Excel", "PowerPoint"),
            0));
        
        questions.add(createQuestion(quiz, 6,
            "Objective trong CV nên viết như thế nào?",
            Arrays.asList("Ngắn gọn, cụ thể", "Dài dòng", "Chung chung", "Không cần"),
            0));
        
        questions.add(createQuestion(quiz, 7,
            "Nên liệt kê kinh nghiệm theo thứ tự nào?",
            Arrays.asList("Mới nhất trước", "Cũ nhất trước", "Ngẫu nhiên", "Theo tên công ty"),
            0));
        
        questions.add(createQuestion(quiz, 8,
            "Nên đề cập mức lương mong muốn trong CV không?",
            Arrays.asList("Không, để thảo luận sau", "Có, luôn luôn", "Tùy tình huống", "Chỉ khi được yêu cầu"),
            0));
        
        questions.add(createQuestion(quiz, 9,
            "Nên dùng màu sắc như thế nào trong CV?",
            Arrays.asList("Tối giản, chuyên nghiệp", "Nhiều màu sắc", "Chỉ đen trắng", "Tùy ngành"),
            0));
        
        questions.add(createQuestion(quiz, 10,
            "Cover letter có cần thiết không?",
            Arrays.asList("Có, nên có", "Không cần", "Tùy công ty", "Chỉ khi được yêu cầu"),
            0));
        
        questions.add(createQuestion(quiz, 11,
            "Nên kiểm tra lỗi chính tả như thế nào?",
            Arrays.asList("Kiểm tra kỹ nhiều lần", "Không cần", "Chỉ kiểm tra một lần", "Dùng auto-correct"),
            0));
        
        questions.add(createQuestion(quiz, 12,
            "Nên cập nhật CV như thế nào?",
            Arrays.asList("Thường xuyên, sau mỗi thành tích", "Chỉ khi tìm việc", "Mỗi năm một lần", "Không cần"),
            0));
        
        return questions;
    }

    private List<QuizQuestion> createInterviewQuestions(Quiz quiz) {
        List<QuizQuestion> questions = new java.util.ArrayList<>();
        
        questions.add(createQuestion(quiz, 1,
            "Nên đến phỏng vấn sớm bao lâu?",
            Arrays.asList("10-15 phút", "30 phút", "1 giờ", "Đúng giờ"),
            0));
        
        questions.add(createQuestion(quiz, 2,
            "Nên mặc gì khi đi phỏng vấn?",
            Arrays.asList("Trang phục chuyên nghiệp", "Quần áo thường", "Đồ thể thao", "Tùy công ty"),
            0));
        
        questions.add(createQuestion(quiz, 3,
            "Kỹ thuật STAR là gì?",
            Arrays.asList("Situation, Task, Action, Result", "Start, Think, Answer, Review", "Study, Test, Apply, Repeat", "Simple, True, Accurate, Relevant"),
            0));
        
        questions.add(createQuestion(quiz, 4,
            "Nên chuẩn bị câu hỏi cho nhà tuyển dụng không?",
            Arrays.asList("Có, 2-3 câu hỏi", "Không cần", "Chỉ 1 câu", "Càng nhiều càng tốt"),
            0));
        
        questions.add(createQuestion(quiz, 5,
            "Nên trả lời câu hỏi về điểm yếu như thế nào?",
            Arrays.asList("Thành thật, nhưng cho thấy đang cải thiện", "Nói không có điểm yếu", "Liệt kê nhiều điểm yếu", "Tránh trả lời"),
            0));
        
        questions.add(createQuestion(quiz, 6,
            "Body language quan trọng như thế nào?",
            Arrays.asList("Rất quan trọng", "Không quan trọng", "Chỉ khi cần", "Tùy tình huống"),
            0));
        
        questions.add(createQuestion(quiz, 7,
            "Nên hỏi về mức lương khi nào?",
            Arrays.asList("Sau khi được đề nghị", "Ngay đầu buổi phỏng vấn", "Không bao giờ", "Khi được hỏi"),
            0));
        
        questions.add(createQuestion(quiz, 8,
            "Nên gửi email cảm ơn sau phỏng vấn không?",
            Arrays.asList("Có, trong vòng 24 giờ", "Không cần", "Sau 1 tuần", "Chỉ khi được nhận"),
            0));
        
        questions.add(createQuestion(quiz, 9,
            "Nên nghiên cứu công ty trước phỏng vấn như thế nào?",
            Arrays.asList("Kỹ lưỡng về sản phẩm, văn hóa", "Không cần", "Chỉ xem website", "Chỉ khi được yêu cầu"),
            0));
        
        questions.add(createQuestion(quiz, 10,
            "Nên mang gì khi đi phỏng vấn?",
            Arrays.asList("CV, portfolio, giấy tờ", "Không cần gì", "Chỉ CV", "Tùy công ty"),
            0));
        
        questions.add(createQuestion(quiz, 11,
            "Nên trả lời câu hỏi về lý do rời công ty cũ như thế nào?",
            Arrays.asList("Tích cực, tập trung vào cơ hội mới", "Chỉ trích công ty cũ", "Tránh trả lời", "Nói dối"),
            0));
        
        questions.add(createQuestion(quiz, 12,
            "Nên đặt câu hỏi gì cho nhà tuyển dụng?",
            Arrays.asList("Về công việc, team, cơ hội phát triển", "Về lương và phúc lợi", "Không đặt câu hỏi", "Câu hỏi cá nhân"),
            0));
        
        return questions;
    }

    private List<QuizQuestion> createGenericTechQuestions(Quiz quiz, String courseTitle) {
        List<QuizQuestion> questions = new java.util.ArrayList<>();
        
        // Tạo câu hỏi dựa trên courseTitle
        if (courseTitle.contains("Spring Boot Microservices") || courseTitle.contains("Microservices")) {
            questions.addAll(createSpringBootMicroservicesQuestions(quiz));
        } else if (courseTitle.contains("Git") || courseTitle.contains("Version Control")) {
            questions.addAll(createGitQuestions(quiz));
        } else if (courseTitle.contains("Docker") || courseTitle.contains("Container")) {
            questions.addAll(createDockerQuestions(quiz));
        } else if (courseTitle.contains("AWS") || courseTitle.contains("Cloud")) {
            questions.addAll(createAWSQuestions(quiz));
        } else {
            // Fallback: tạo câu hỏi generic cho technical courses
            for (int i = 1; i <= 12; i++) {
                questions.add(createGenericTechQuestion(quiz, i, courseTitle));
            }
        }
        
        // Đảm bảo có đủ 12 câu
        while (questions.size() < 12) {
            questions.add(createGenericTechQuestion(quiz, questions.size() + 1, courseTitle));
        }
        if (questions.size() > 12) {
            questions = questions.subList(0, 12);
        }
        
        return questions;
    }

    private List<QuizQuestion> createGenericQuestions(Quiz quiz, String courseTitle) {
        List<QuizQuestion> questions = new java.util.ArrayList<>();
        
        // Tạo câu hỏi dựa trên courseTitle cho non-technical courses
        if (courseTitle.contains("Kế hoạch") || courseTitle.contains("sự nghiệp") || courseTitle.contains("Career")) {
            questions.addAll(createCareerPlanningQuestions(quiz));
        } else if (courseTitle.contains("Giao tiếp") || courseTitle.contains("Communication")) {
            questions.addAll(createCommunicationQuestions(quiz));
        } else if (courseTitle.contains("Thương hiệu") || courseTitle.contains("Branding")) {
            questions.addAll(createPersonalBrandingQuestions(quiz));
        } else if (courseTitle.contains("Thời gian") || courseTitle.contains("Time")) {
            questions.addAll(createTimeManagementQuestions(quiz));
        } else if (courseTitle.contains("Đàm phán") || courseTitle.contains("Negotiation")) {
            questions.addAll(createNegotiationQuestions(quiz));
        } else if (courseTitle.contains("Làm việc nhóm") || courseTitle.contains("Teamwork")) {
            questions.addAll(createTeamworkQuestions(quiz));
        } else {
            // Fallback: tạo câu hỏi generic
            for (int i = 1; i <= 12; i++) {
                questions.add(createGenericQuestion(quiz, i, courseTitle));
            }
        }
        
        // Đảm bảo có đủ 12 câu
        while (questions.size() < 12) {
            questions.add(createGenericQuestion(quiz, questions.size() + 1, courseTitle));
        }
        if (questions.size() > 12) {
            questions = questions.subList(0, 12);
        }
        
        return questions;
    }

    private QuizQuestion createGenericQuestion(Quiz quiz, int order, String courseTitle) {
        List<String> options = Arrays.asList(
                "Đáp án A",
                "Đáp án B",
                "Đáp án C",
                "Đáp án D"
        );
        String questionText = "Câu hỏi " + order + " về " + courseTitle;
        int correctAnswer = (order - 1) % 4;
        return createQuestion(quiz, order, questionText, options, correctAnswer);
    }

    private QuizQuestion createGenericTechQuestion(Quiz quiz, int order, String courseTitle) {
        List<String> options = Arrays.asList(
                "Đáp án A",
                "Đáp án B",
                "Đáp án C",
                "Đáp án D"
        );
        String questionText = "Câu hỏi " + order + " về " + courseTitle;
        int correctAnswer = (order - 1) % 4;
        return createQuestion(quiz, order, questionText, options, correctAnswer);
    }

    private QuizQuestion createQuestion(Quiz quiz, int order, String questionText, 
                                       List<String> options, int correctAnswer) {
        return QuizQuestion.builder()
                .quiz(quiz)
                .question(questionText)
                .questionType(QuizQuestion.QuestionType.SINGLE_CHOICE)
                .options(options)
                .correctAnswer(String.valueOf(correctAnswer))
                .points(1)
                .orderIndex(order)
                .build();
    }

    // Spring Boot Microservices Questions
    private List<QuizQuestion> createSpringBootMicroservicesQuestions(Quiz quiz) {
        List<QuizQuestion> questions = new java.util.ArrayList<>();
        
        questions.add(createQuestion(quiz, 1,
            "Microservices architecture là gì?",
            Arrays.asList("Kiến trúc chia ứng dụng thành các service độc lập", "Một framework Java", "Một database", "Một IDE"),
            0));
        
        questions.add(createQuestion(quiz, 2,
            "Eureka Server trong Spring Cloud dùng để làm gì?",
            Arrays.asList("Service discovery", "Load balancing", "API Gateway", "Database"),
            0));
        
        questions.add(createQuestion(quiz, 3,
            "Feign Client dùng để làm gì?",
            Arrays.asList("Gọi REST API giữa các microservices", "Tạo database", "Quản lý cache", "Xử lý authentication"),
            0));
        
        questions.add(createQuestion(quiz, 4,
            "API Gateway trong microservices có vai trò gì?",
            Arrays.asList("Điểm vào duy nhất cho tất cả requests", "Database server", "Message queue", "File storage"),
            0));
        
        questions.add(createQuestion(quiz, 5,
            "Circuit Breaker pattern dùng để làm gì?",
            Arrays.asList("Ngăn chặn cascade failure", "Tăng tốc độ", "Giảm memory", "Tăng security"),
            0));
        
        questions.add(createQuestion(quiz, 6,
            "Spring Cloud Config dùng để làm gì?",
            Arrays.asList("Quản lý cấu hình tập trung", "Quản lý database", "Quản lý cache", "Quản lý logs"),
            0));
        
        questions.add(createQuestion(quiz, 7,
            "Load balancing trong microservices có lợi ích gì?",
            Arrays.asList("Phân tải requests giữa các instances", "Tăng tốc database", "Giảm memory", "Tăng security"),
            0));
        
        questions.add(createQuestion(quiz, 8,
            "Distributed tracing dùng để làm gì?",
            Arrays.asList("Theo dõi request qua nhiều services", "Tăng tốc độ", "Giảm memory", "Tăng security"),
            0));
        
        questions.add(createQuestion(quiz, 9,
            "Message queue trong microservices dùng để làm gì?",
            Arrays.asList("Giao tiếp bất đồng bộ giữa services", "Tăng tốc độ", "Giảm memory", "Tăng security"),
            0));
        
        questions.add(createQuestion(quiz, 10,
            "Service mesh là gì?",
            Arrays.asList("Infrastructure layer cho service-to-service communication", "Một framework", "Một database", "Một IDE"),
            0));
        
        questions.add(createQuestion(quiz, 11,
            "API Gateway có thể thực hiện chức năng gì?",
            Arrays.asList("Routing, authentication, rate limiting", "Chỉ routing", "Chỉ authentication", "Chỉ rate limiting"),
            0));
        
        questions.add(createQuestion(quiz, 12,
            "Khi nào nên sử dụng microservices?",
            Arrays.asList("Khi ứng dụng lớn, cần scale độc lập", "Luôn luôn", "Chỉ cho ứng dụng nhỏ", "Không bao giờ"),
            0));
        
        return questions;
    }

    // Git Questions
    private List<QuizQuestion> createGitQuestions(Quiz quiz) {
        List<QuizQuestion> questions = new java.util.ArrayList<>();
        
        questions.add(createQuestion(quiz, 1,
            "Git là gì?",
            Arrays.asList("Hệ thống quản lý phiên bản phân tán", "Một IDE", "Một database", "Một framework"),
            0));
        
        questions.add(createQuestion(quiz, 2,
            "Lệnh nào dùng để commit changes?",
            Arrays.asList("git commit", "git push", "git pull", "git merge"),
            0));
        
        questions.add(createQuestion(quiz, 3,
            "Branch trong Git dùng để làm gì?",
            Arrays.asList("Tách nhánh phát triển độc lập", "Xóa code", "Tăng tốc độ", "Giảm memory"),
            0));
        
        questions.add(createQuestion(quiz, 4,
            "Lệnh nào dùng để tạo branch mới?",
            Arrays.asList("git checkout -b", "git branch new", "git create branch", "git new branch"),
            0));
        
        questions.add(createQuestion(quiz, 5,
            "Merge conflict xảy ra khi nào?",
            Arrays.asList("Khi có thay đổi xung đột giữa các branch", "Khi commit", "Khi push", "Khi pull"),
            0));
        
        questions.add(createQuestion(quiz, 6,
            "Lệnh nào dùng để xem lịch sử commit?",
            Arrays.asList("git log", "git history", "git show", "git list"),
            0));
        
        questions.add(createQuestion(quiz, 7,
            "GitHub là gì?",
            Arrays.asList("Platform lưu trữ Git repositories", "Một IDE", "Một database", "Một framework"),
            0));
        
        questions.add(createQuestion(quiz, 8,
            "Pull request dùng để làm gì?",
            Arrays.asList("Đề xuất merge code từ branch này sang branch khác", "Xóa code", "Tăng tốc độ", "Giảm memory"),
            0));
        
        questions.add(createQuestion(quiz, 9,
            "Lệnh nào dùng để undo commit cuối cùng?",
            Arrays.asList("git reset", "git undo", "git revert", "git delete"),
            0));
        
        questions.add(createQuestion(quiz, 10,
            ".gitignore file dùng để làm gì?",
            Arrays.asList("Bỏ qua các file không cần track", "Track tất cả files", "Xóa files", "Backup files"),
            0));
        
        questions.add(createQuestion(quiz, 11,
            "Staging area trong Git là gì?",
            Arrays.asList("Nơi chuẩn bị changes trước khi commit", "Nơi lưu code", "Nơi xóa code", "Nơi backup code"),
            0));
        
        questions.add(createQuestion(quiz, 12,
            "Lệnh nào dùng để xem trạng thái repository?",
            Arrays.asList("git status", "git state", "git info", "git show"),
            0));
        
        return questions;
    }

    // Docker Questions
    private List<QuizQuestion> createDockerQuestions(Quiz quiz) {
        List<QuizQuestion> questions = new java.util.ArrayList<>();
        
        questions.add(createQuestion(quiz, 1,
            "Docker là gì?",
            Arrays.asList("Platform containerization", "Một IDE", "Một database", "Một framework"),
            0));
        
        questions.add(createQuestion(quiz, 2,
            "Dockerfile dùng để làm gì?",
            Arrays.asList("Định nghĩa cách build Docker image", "Chạy container", "Xóa container", "Backup container"),
            0));
        
        questions.add(createQuestion(quiz, 3,
            "Lệnh nào dùng để build Docker image?",
            Arrays.asList("docker build", "docker create", "docker make", "docker generate"),
            0));
        
        questions.add(createQuestion(quiz, 4,
            "Container khác với Virtual Machine như thế nào?",
            Arrays.asList("Container chia sẻ OS kernel", "Container không chia sẻ gì", "Container là VM", "Không có khác biệt"),
            0));
        
        questions.add(createQuestion(quiz, 5,
            "Docker Compose dùng để làm gì?",
            Arrays.asList("Quản lý multi-container applications", "Chạy một container", "Xóa containers", "Backup containers"),
            0));
        
        questions.add(createQuestion(quiz, 6,
            "Lệnh nào dùng để chạy container?",
            Arrays.asList("docker run", "docker start", "docker execute", "docker launch"),
            0));
        
        questions.add(createQuestion(quiz, 7,
            "Docker Hub là gì?",
            Arrays.asList("Registry lưu trữ Docker images", "Một IDE", "Một database", "Một framework"),
            0));
        
        questions.add(createQuestion(quiz, 8,
            "Volume trong Docker dùng để làm gì?",
            Arrays.asList("Lưu trữ dữ liệu persistent", "Tăng tốc độ", "Giảm memory", "Tăng security"),
            0));
        
        questions.add(createQuestion(quiz, 9,
            "Lệnh nào dùng để xem danh sách containers đang chạy?",
            Arrays.asList("docker ps", "docker list", "docker show", "docker containers"),
            0));
        
        questions.add(createQuestion(quiz, 10,
            "Docker network dùng để làm gì?",
            Arrays.asList("Kết nối containers với nhau", "Tăng tốc độ", "Giảm memory", "Tăng security"),
            0));
        
        questions.add(createQuestion(quiz, 11,
            "Lệnh nào dùng để dừng container?",
            Arrays.asList("docker stop", "docker kill", "docker pause", "docker halt"),
            0));
        
        questions.add(createQuestion(quiz, 12,
            "Multi-stage build trong Docker có lợi ích gì?",
            Arrays.asList("Giảm kích thước image cuối cùng", "Tăng tốc độ", "Giảm memory", "Tăng security"),
            0));
        
        return questions;
    }

    // AWS Questions
    private List<QuizQuestion> createAWSQuestions(Quiz quiz) {
        List<QuizQuestion> questions = new java.util.ArrayList<>();
        
        questions.add(createQuestion(quiz, 1,
            "AWS là gì?",
            Arrays.asList("Amazon Web Services - Cloud platform", "Một IDE", "Một database", "Một framework"),
            0));
        
        questions.add(createQuestion(quiz, 2,
            "EC2 trong AWS là gì?",
            Arrays.asList("Elastic Compute Cloud - Virtual servers", "Database service", "Storage service", "Networking service"),
            0));
        
        questions.add(createQuestion(quiz, 3,
            "S3 trong AWS là gì?",
            Arrays.asList("Simple Storage Service - Object storage", "Compute service", "Database service", "Networking service"),
            0));
        
        questions.add(createQuestion(quiz, 4,
            "RDS trong AWS là gì?",
            Arrays.asList("Relational Database Service", "Storage service", "Compute service", "Networking service"),
            0));
        
        questions.add(createQuestion(quiz, 5,
            "Lambda trong AWS là gì?",
            Arrays.asList("Serverless compute service", "Database service", "Storage service", "Networking service"),
            0));
        
        questions.add(createQuestion(quiz, 6,
            "VPC trong AWS là gì?",
            Arrays.asList("Virtual Private Cloud - Isolated network", "Database service", "Storage service", "Compute service"),
            0));
        
        questions.add(createQuestion(quiz, 7,
            "CloudFront trong AWS là gì?",
            Arrays.asList("Content Delivery Network", "Database service", "Storage service", "Compute service"),
            0));
        
        questions.add(createQuestion(quiz, 8,
            "IAM trong AWS là gì?",
            Arrays.asList("Identity and Access Management", "Database service", "Storage service", "Compute service"),
            0));
        
        questions.add(createQuestion(quiz, 9,
            "Auto Scaling trong AWS dùng để làm gì?",
            Arrays.asList("Tự động điều chỉnh số lượng instances", "Tăng tốc độ", "Giảm memory", "Tăng security"),
            0));
        
        questions.add(createQuestion(quiz, 10,
            "Elastic Load Balancer trong AWS dùng để làm gì?",
            Arrays.asList("Phân tải traffic giữa các instances", "Tăng tốc độ", "Giảm memory", "Tăng security"),
            0));
        
        questions.add(createQuestion(quiz, 11,
            "Region trong AWS là gì?",
            Arrays.asList("Khu vực địa lý chứa data centers", "Database service", "Storage service", "Compute service"),
            0));
        
        questions.add(createQuestion(quiz, 12,
            "Availability Zone trong AWS là gì?",
            Arrays.asList("Data center riêng biệt trong một region", "Database service", "Storage service", "Compute service"),
            0));
        
        return questions;
    }

    // SQL Questions
    private List<QuizQuestion> createSQLQuestions(Quiz quiz) {
        List<QuizQuestion> questions = new java.util.ArrayList<>();
        
        questions.add(createQuestion(quiz, 1,
            "SQL là viết tắt của gì?",
            Arrays.asList("Structured Query Language", "Simple Query Language", "Standard Query Language", "System Query Language"),
            0));
        
        questions.add(createQuestion(quiz, 2,
            "Câu lệnh nào dùng để lấy dữ liệu từ bảng?",
            Arrays.asList("SELECT", "GET", "FETCH", "RETRIEVE"),
            0));
        
        questions.add(createQuestion(quiz, 3,
            "Câu lệnh nào dùng để thêm dữ liệu vào bảng?",
            Arrays.asList("INSERT", "ADD", "CREATE", "UPDATE"),
            0));
        
        questions.add(createQuestion(quiz, 4,
            "Câu lệnh nào dùng để cập nhật dữ liệu?",
            Arrays.asList("UPDATE", "MODIFY", "CHANGE", "ALTER"),
            0));
        
        questions.add(createQuestion(quiz, 5,
            "Câu lệnh nào dùng để xóa dữ liệu?",
            Arrays.asList("DELETE", "REMOVE", "DROP", "TRUNCATE"),
            0));
        
        questions.add(createQuestion(quiz, 6,
            "JOIN nào trả về tất cả records từ cả hai bảng?",
            Arrays.asList("FULL OUTER JOIN", "INNER JOIN", "LEFT JOIN", "RIGHT JOIN"),
            0));
        
        questions.add(createQuestion(quiz, 7,
            "PRIMARY KEY trong database là gì?",
            Arrays.asList("Khóa chính, định danh duy nhất cho mỗi row", "Khóa ngoại", "Index", "Constraint"),
            0));
        
        questions.add(createQuestion(quiz, 8,
            "FOREIGN KEY trong database là gì?",
            Arrays.asList("Khóa ngoại, tham chiếu đến PRIMARY KEY của bảng khác", "Khóa chính", "Index", "Constraint"),
            0));
        
        questions.add(createQuestion(quiz, 9,
            "GROUP BY dùng để làm gì?",
            Arrays.asList("Nhóm các rows có cùng giá trị", "Sắp xếp dữ liệu", "Lọc dữ liệu", "Cập nhật dữ liệu"),
            0));
        
        questions.add(createQuestion(quiz, 10,
            "HAVING clause khác với WHERE như thế nào?",
            Arrays.asList("HAVING dùng với GROUP BY, WHERE dùng với rows", "Không khác gì", "HAVING nhanh hơn", "WHERE nhanh hơn"),
            0));
        
        questions.add(createQuestion(quiz, 11,
            "Normalization trong database design là gì?",
            Arrays.asList("Quá trình tổ chức dữ liệu để giảm redundancy", "Tăng tốc độ", "Giảm memory", "Tăng security"),
            0));
        
        questions.add(createQuestion(quiz, 12,
            "Index trong database dùng để làm gì?",
            Arrays.asList("Tăng tốc độ truy vấn", "Lưu trữ dữ liệu", "Xóa dữ liệu", "Cập nhật dữ liệu"),
            0));
        
        return questions;
    }

    // Career Planning Questions
    private List<QuizQuestion> createCareerPlanningQuestions(Quiz quiz) {
        List<QuizQuestion> questions = new java.util.ArrayList<>();
        
        questions.add(createQuestion(quiz, 1,
            "Kế hoạch sự nghiệp 5 năm nên bao gồm gì?",
            Arrays.asList("Mục tiêu ngắn hạn, dài hạn và kế hoạch hành động", "Chỉ mục tiêu", "Chỉ kế hoạch", "Không cần gì"),
            0));
        
        questions.add(createQuestion(quiz, 2,
            "SMART goals là gì?",
            Arrays.asList("Specific, Measurable, Achievable, Relevant, Time-bound", "Simple, Medium, Advanced, Real, True", "Small, Medium, Average, Regular, Typical", "Standard, Modern, Active, Real, True"),
            0));
        
        questions.add(createQuestion(quiz, 3,
            "Nên đánh giá lại kế hoạch sự nghiệp khi nào?",
            Arrays.asList("Định kỳ hàng năm hoặc khi có thay đổi lớn", "Không bao giờ", "Chỉ một lần", "Mỗi tháng"),
            0));
        
        questions.add(createQuestion(quiz, 4,
            "Mentor trong sự nghiệp có vai trò gì?",
            Arrays.asList("Hướng dẫn và chia sẻ kinh nghiệm", "Tìm việc cho bạn", "Trả lương cho bạn", "Không có vai trò gì"),
            0));
        
        questions.add(createQuestion(quiz, 5,
            "Networking trong sự nghiệp quan trọng như thế nào?",
            Arrays.asList("Rất quan trọng để mở rộng cơ hội", "Không quan trọng", "Chỉ khi cần", "Tùy ngành"),
            0));
        
        questions.add(createQuestion(quiz, 6,
            "Skill gap analysis là gì?",
            Arrays.asList("Phân tích khoảng cách kỹ năng hiện tại và cần thiết", "Phân tích lương", "Phân tích công ty", "Phân tích thị trường"),
            0));
        
        questions.add(createQuestion(quiz, 7,
            "Nên học kỹ năng mới như thế nào?",
            Arrays.asList("Theo kế hoạch, ưu tiên kỹ năng liên quan", "Học tất cả cùng lúc", "Không cần học", "Chỉ học khi được yêu cầu"),
            0));
        
        questions.add(createQuestion(quiz, 8,
            "Career pivot là gì?",
            Arrays.asList("Chuyển hướng sự nghiệp sang lĩnh vực khác", "Thăng chức", "Nghỉ việc", "Đổi công ty"),
            0));
        
        questions.add(createQuestion(quiz, 9,
            "Portfolio trong sự nghiệp dùng để làm gì?",
            Arrays.asList("Thể hiện thành tích và dự án đã làm", "Lưu trữ tài liệu", "Tính lương", "Không có mục đích"),
            0));
        
        questions.add(createQuestion(quiz, 10,
            "Nên cập nhật LinkedIn profile như thế nào?",
            Arrays.asList("Thường xuyên với thành tích mới", "Không bao giờ", "Chỉ khi tìm việc", "Mỗi năm một lần"),
            0));
        
        questions.add(createQuestion(quiz, 11,
            "Work-life balance quan trọng như thế nào?",
            Arrays.asList("Rất quan trọng cho sức khỏe và hiệu suất", "Không quan trọng", "Chỉ khi cần", "Tùy người"),
            0));
        
        questions.add(createQuestion(quiz, 12,
            "Nên đặt mục tiêu sự nghiệp như thế nào?",
            Arrays.asList("Thực tế, có thể đạt được, có thời hạn", "Cao nhất có thể", "Thấp nhất có thể", "Không cần mục tiêu"),
            0));
        
        return questions;
    }

    // Communication Questions
    private List<QuizQuestion> createCommunicationQuestions(Quiz quiz) {
        List<QuizQuestion> questions = new java.util.ArrayList<>();
        
        questions.add(createQuestion(quiz, 1,
            "Giao tiếp hiệu quả bao gồm những gì?",
            Arrays.asList("Nghe, nói, hiểu và phản hồi", "Chỉ nói", "Chỉ nghe", "Chỉ viết"),
            0));
        
        questions.add(createQuestion(quiz, 2,
            "Active listening là gì?",
            Arrays.asList("Lắng nghe tích cực và hiểu đầy đủ", "Chỉ nghe một phần", "Không nghe", "Nghe nhưng không hiểu"),
            0));
        
        questions.add(createQuestion(quiz, 3,
            "Body language quan trọng như thế nào trong giao tiếp?",
            Arrays.asList("Rất quan trọng, chiếm 55% thông điệp", "Không quan trọng", "Chỉ khi cần", "Tùy tình huống"),
            0));
        
        questions.add(createQuestion(quiz, 4,
            "Nên xử lý xung đột trong giao tiếp như thế nào?",
            Arrays.asList("Lắng nghe, thấu hiểu và tìm giải pháp", "Tranh cãi", "Tránh né", "Im lặng"),
            0));
        
        questions.add(createQuestion(quiz, 5,
            "Feedback hiệu quả nên như thế nào?",
            Arrays.asList("Cụ thể, xây dựng và kịp thời", "Chung chung", "Chỉ khen", "Chỉ chê"),
            0));
        
        questions.add(createQuestion(quiz, 6,
            "Email chuyên nghiệp nên có gì?",
            Arrays.asList("Subject rõ ràng, nội dung ngắn gọn, lịch sự", "Dài dòng", "Không có subject", "Thiếu lịch sự"),
            0));
        
        questions.add(createQuestion(quiz, 7,
            "Presentation hiệu quả cần gì?",
            Arrays.asList("Cấu trúc rõ ràng, visual aids, practice", "Chỉ nói", "Chỉ slides", "Không cần chuẩn bị"),
            0));
        
        questions.add(createQuestion(quiz, 8,
            "Nên giao tiếp với sếp như thế nào?",
            Arrays.asList("Tôn trọng, rõ ràng, chủ động", "Thụ động", "Tránh né", "Tùy ý"),
            0));
        
        questions.add(createQuestion(quiz, 9,
            "Cross-cultural communication cần lưu ý gì?",
            Arrays.asList("Tôn trọng khác biệt văn hóa", "Bỏ qua khác biệt", "Áp đặt văn hóa của mình", "Không cần lưu ý"),
            0));
        
        questions.add(createQuestion(quiz, 10,
            "Non-verbal communication bao gồm gì?",
            Arrays.asList("Body language, eye contact, tone", "Chỉ lời nói", "Chỉ viết", "Không có gì"),
            0));
        
        questions.add(createQuestion(quiz, 11,
            "Nên xử lý thông tin sai lệch như thế nào?",
            Arrays.asList("Làm rõ với nguồn gốc và bằng chứng", "Bỏ qua", "Truyền bá thêm", "Không làm gì"),
            0));
        
        questions.add(createQuestion(quiz, 12,
            "Empathy trong giao tiếp là gì?",
            Arrays.asList("Hiểu và chia sẻ cảm xúc của người khác", "Chỉ hiểu", "Chỉ chia sẻ", "Không liên quan"),
            0));
        
        return questions;
    }

    // Personal Branding Questions
    private List<QuizQuestion> createPersonalBrandingQuestions(Quiz quiz) {
        List<QuizQuestion> questions = new java.util.ArrayList<>();
        
        questions.add(createQuestion(quiz, 1,
            "Personal branding là gì?",
            Arrays.asList("Xây dựng hình ảnh và danh tiếng cá nhân", "Tạo logo", "Tạo website", "Tạo app"),
            0));
        
        questions.add(createQuestion(quiz, 2,
            "LinkedIn profile nên có gì?",
            Arrays.asList("Professional photo, headline, summary, experience", "Chỉ ảnh", "Chỉ tên", "Không cần gì"),
            0));
        
        questions.add(createQuestion(quiz, 3,
            "Content strategy cho personal brand nên như thế nào?",
            Arrays.asList("Consistent, valuable, authentic", "Ngẫu nhiên", "Chỉ quảng cáo", "Sao chép"),
            0));
        
        questions.add(createQuestion(quiz, 4,
            "Nên chia sẻ nội dung gì trên LinkedIn?",
            Arrays.asList("Insights, achievements, industry news", "Chỉ ảnh cá nhân", "Chỉ meme", "Không chia sẻ gì"),
            0));
        
        questions.add(createQuestion(quiz, 5,
            "Networking online hiệu quả cần gì?",
            Arrays.asList("Engage với content, comment, share", "Chỉ like", "Chỉ follow", "Không làm gì"),
            0));
        
        questions.add(createQuestion(quiz, 6,
            "Personal brand statement nên như thế nào?",
            Arrays.asList("Ngắn gọn, rõ ràng về giá trị bạn mang lại", "Dài dòng", "Chung chung", "Không cần"),
            0));
        
        questions.add(createQuestion(quiz, 7,
            "Nên xây dựng expertise như thế nào?",
            Arrays.asList("Chuyên sâu một lĩnh vực, chia sẻ kiến thức", "Biết tất cả", "Không cần chuyên sâu", "Sao chép người khác"),
            0));
        
        questions.add(createQuestion(quiz, 8,
            "Online presence quan trọng như thế nào?",
            Arrays.asList("Rất quan trọng trong thời đại số", "Không quan trọng", "Chỉ khi cần", "Tùy ngành"),
            0));
        
        questions.add(createQuestion(quiz, 9,
            "Nên quản lý reputation online như thế nào?",
            Arrays.asList("Monitor, respond, maintain consistency", "Bỏ qua", "Chỉ khi có vấn đề", "Không cần quản lý"),
            0));
        
        questions.add(createQuestion(quiz, 10,
            "Thought leadership là gì?",
            Arrays.asList("Dẫn dắt suy nghĩ trong lĩnh vực của bạn", "Chỉ follow", "Chỉ like", "Không liên quan"),
            0));
        
        questions.add(createQuestion(quiz, 11,
            "Nên tạo content như thế nào?",
            Arrays.asList("Original, valuable, consistent", "Sao chép", "Ngẫu nhiên", "Chỉ khi có thời gian"),
            0));
        
        questions.add(createQuestion(quiz, 12,
            "Personal brand cần thời gian bao lâu để xây dựng?",
            Arrays.asList("Lâu dài, cần consistency và patience", "1 tuần", "1 tháng", "Không cần thời gian"),
            0));
        
        return questions;
    }

    // Time Management Questions
    private List<QuizQuestion> createTimeManagementQuestions(Quiz quiz) {
        List<QuizQuestion> questions = new java.util.ArrayList<>();
        
        questions.add(createQuestion(quiz, 1,
            "Time management là gì?",
            Arrays.asList("Quản lý thời gian hiệu quả để đạt mục tiêu", "Làm việc nhiều giờ", "Làm việc nhanh", "Làm việc chậm"),
            0));
        
        questions.add(createQuestion(quiz, 2,
            "Pomodoro Technique là gì?",
            Arrays.asList("Làm việc 25 phút, nghỉ 5 phút", "Làm việc liên tục", "Nghỉ liên tục", "Không có kỹ thuật"),
            0));
        
        questions.add(createQuestion(quiz, 3,
            "Eisenhower Matrix phân loại công việc như thế nào?",
            Arrays.asList("Urgent/Important, Urgent/Not Important, Not Urgent/Important, Not Urgent/Not Important", "Chỉ Important", "Chỉ Urgent", "Không phân loại"),
            0));
        
        questions.add(createQuestion(quiz, 4,
            "Nên ưu tiên công việc như thế nào?",
            Arrays.asList("Theo mức độ quan trọng và khẩn cấp", "Ngẫu nhiên", "Theo thứ tự nhận được", "Theo độ khó"),
            0));
        
        questions.add(createQuestion(quiz, 5,
            "Time blocking là gì?",
            Arrays.asList("Chia thời gian thành các block cho từng task", "Làm tất cả cùng lúc", "Không lên kế hoạch", "Làm khi nào cũng được"),
            0));
        
        questions.add(createQuestion(quiz, 6,
            "Multitasking có hiệu quả không?",
            Arrays.asList("Không, làm giảm chất lượng và hiệu suất", "Có, rất hiệu quả", "Tùy người", "Tùy task"),
            0));
        
        questions.add(createQuestion(quiz, 7,
            "Nên xử lý interruptions như thế nào?",
            Arrays.asList("Schedule time cho interruptions, set boundaries", "Luôn trả lời ngay", "Bỏ qua tất cả", "Tùy tình huống"),
            0));
        
        questions.add(createQuestion(quiz, 8,
            "Delegation quan trọng như thế nào?",
            Arrays.asList("Rất quan trọng để tối ưu thời gian", "Không quan trọng", "Chỉ khi cần", "Tùy người"),
            0));
        
        questions.add(createQuestion(quiz, 9,
            "Nên lên kế hoạch ngày như thế nào?",
            Arrays.asList("Buổi tối hôm trước hoặc sáng sớm", "Giữa ngày", "Cuối ngày", "Không cần"),
            0));
        
        questions.add(createQuestion(quiz, 10,
            "Procrastination nên xử lý như thế nào?",
            Arrays.asList("Break down tasks, start small, eliminate distractions", "Bỏ qua", "Để sau", "Không xử lý"),
            0));
        
        questions.add(createQuestion(quiz, 11,
            "Work-life balance đạt được bằng cách nào?",
            Arrays.asList("Set boundaries, prioritize, schedule downtime", "Làm việc nhiều hơn", "Nghỉ nhiều hơn", "Không cần balance"),
            0));
        
        questions.add(createQuestion(quiz, 12,
            "Energy management quan trọng như thế nào?",
            Arrays.asList("Quan trọng như time management", "Không quan trọng", "Chỉ khi mệt", "Tùy người"),
            0));
        
        return questions;
    }

    // Negotiation Questions
    private List<QuizQuestion> createNegotiationQuestions(Quiz quiz) {
        List<QuizQuestion> questions = new java.util.ArrayList<>();
        
        questions.add(createQuestion(quiz, 1,
            "Đàm phán lương nên chuẩn bị gì?",
            Arrays.asList("Research market rate, prepare achievements, set range", "Chỉ set số tiền", "Không cần chuẩn bị", "Chỉ nói số tiền mong muốn"),
            0));
        
        questions.add(createQuestion(quiz, 2,
            "Nên đàm phán lương khi nào?",
            Arrays.asList("Sau khi được offer, trước khi accept", "Ngay đầu phỏng vấn", "Sau khi nhận việc", "Không bao giờ"),
            0));
        
        questions.add(createQuestion(quiz, 3,
            "BATNA là gì?",
            Arrays.asList("Best Alternative To Negotiated Agreement", "Best Answer To Negotiation", "Best Approach To Negotiation", "Best Action To Negotiation"),
            0));
        
        questions.add(createQuestion(quiz, 4,
            "Nên trình bày giá trị bản thân như thế nào?",
            Arrays.asList("Dựa trên achievements và contributions", "Chỉ nói về nhu cầu", "Chỉ nói về kinh nghiệm", "Không cần trình bày"),
            0));
        
        questions.add(createQuestion(quiz, 5,
            "Win-win negotiation là gì?",
            Arrays.asList("Cả hai bên đều hài lòng với kết quả", "Chỉ một bên thắng", "Cả hai bên thua", "Không có kết quả"),
            0));
        
        questions.add(createQuestion(quiz, 6,
            "Nên xử lý offer thấp như thế nào?",
            Arrays.asList("Counter với data và justification", "Chấp nhận ngay", "Từ chối ngay", "Không phản hồi"),
            0));
        
        questions.add(createQuestion(quiz, 7,
            "Non-salary benefits có thể đàm phán không?",
            Arrays.asList("Có, như flexible hours, remote work, training", "Không", "Chỉ lương", "Tùy công ty"),
            0));
        
        questions.add(createQuestion(quiz, 8,
            "Nên đàm phán với confidence như thế nào?",
            Arrays.asList("Calm, professional, data-driven", "Aggressive", "Passive", "Emotional"),
            0));
        
        questions.add(createQuestion(quiz, 9,
            "Silence trong đàm phán có tác dụng gì?",
            Arrays.asList("Tạo áp lực và cho đối phương suy nghĩ", "Không có tác dụng", "Làm mất thời gian", "Gây khó chịu"),
            0));
        
        questions.add(createQuestion(quiz, 10,
            "Nên research market rate như thế nào?",
            Arrays.asList("Glassdoor, LinkedIn, industry reports", "Chỉ hỏi bạn bè", "Chỉ đoán", "Không cần research"),
            0));
        
        questions.add(createQuestion(quiz, 11,
            "Nên counter offer như thế nào?",
            Arrays.asList("Higher than target, có room để negotiate", "Đúng target", "Thấp hơn target", "Không counter"),
            0));
        
        questions.add(createQuestion(quiz, 12,
            "Nên xử lý rejection như thế nào?",
            Arrays.asList("Professional, ask for feedback, maintain relationship", "Tức giận", "Tránh né", "Không phản hồi"),
            0));
        
        return questions;
    }

    // Teamwork Questions
    private List<QuizQuestion> createTeamworkQuestions(Quiz quiz) {
        List<QuizQuestion> questions = new java.util.ArrayList<>();
        
        questions.add(createQuestion(quiz, 1,
            "Teamwork hiệu quả cần gì?",
            Arrays.asList("Communication, trust, shared goals", "Chỉ communication", "Chỉ trust", "Chỉ goals"),
            0));
        
        questions.add(createQuestion(quiz, 2,
            "Nên xử lý conflict trong team như thế nào?",
            Arrays.asList("Address directly, listen, find solution", "Tránh né", "Tranh cãi", "Im lặng"),
            0));
        
        questions.add(createQuestion(quiz, 3,
            "Role clarity trong team quan trọng như thế nào?",
            Arrays.asList("Rất quan trọng để tránh overlap", "Không quan trọng", "Chỉ khi cần", "Tùy team"),
            0));
        
        questions.add(createQuestion(quiz, 4,
            "Nên đóng góp vào team như thế nào?",
            Arrays.asList("Active participation, share ideas, support others", "Chỉ làm việc của mình", "Chỉ chỉ trích", "Không đóng góp"),
            0));
        
        questions.add(createQuestion(quiz, 5,
            "Accountability trong team là gì?",
            Arrays.asList("Chịu trách nhiệm về công việc và kết quả", "Chỉ trách nhiệm cá nhân", "Không có trách nhiệm", "Chỉ trách nhiệm của leader"),
            0));
        
        questions.add(createQuestion(quiz, 6,
            "Nên give feedback trong team như thế nào?",
            Arrays.asList("Constructive, specific, timely", "Chung chung", "Chỉ khen", "Chỉ chê"),
            0));
        
        questions.add(createQuestion(quiz, 7,
            "Diversity trong team có lợi ích gì?",
            Arrays.asList("Nhiều perspectives, creativity, innovation", "Không có lợi ích", "Chỉ gây khó khăn", "Tùy team"),
            0));
        
        questions.add(createQuestion(quiz, 8,
            "Nên celebrate team success như thế nào?",
            Arrays.asList("Recognize contributions, share credit", "Chỉ leader nhận credit", "Không celebrate", "Chỉ một người"),
            0));
        
        questions.add(createQuestion(quiz, 9,
            "Nên xử lý underperformer trong team như thế nào?",
            Arrays.asList("Support, provide feedback, set expectations", "Bỏ qua", "Chỉ trích", "Đuổi việc ngay"),
            0));
        
        questions.add(createQuestion(quiz, 10,
            "Team meetings nên như thế nào?",
            Arrays.asList("Agenda, time-bound, action items", "Không có agenda", "Kéo dài", "Không có action items"),
            0));
        
        questions.add(createQuestion(quiz, 11,
            "Remote teamwork cần gì đặc biệt?",
            Arrays.asList("Clear communication, tools, regular check-ins", "Chỉ tools", "Chỉ communication", "Không cần gì đặc biệt"),
            0));
        
        questions.add(createQuestion(quiz, 12,
            "Team culture quan trọng như thế nào?",
            Arrays.asList("Rất quan trọng cho hiệu suất và satisfaction", "Không quan trọng", "Chỉ khi cần", "Tùy team"),
            0));
        
        return questions;
    }
}

