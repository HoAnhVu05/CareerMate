package vn.careermate.aiservice.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.reactive.function.client.WebClient;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.mock;

@ExtendWith(MockitoExtension.class)
public class AIServiceTest {

    @Mock
    private WebClient.Builder webClientBuilder;

    @Mock
    private GeminiService geminiService;

    private AIService aiService;

    @BeforeEach
    public void setUp() {
        // Setup minimal mock for WebClient builder fluent API
        WebClient webClient = mock(WebClient.class);
        lenient().when(webClientBuilder.baseUrl(anyString())).thenReturn(webClientBuilder);
        lenient().when(webClientBuilder.defaultHeader(anyString(), anyString())).thenReturn(webClientBuilder);
        lenient().when(webClientBuilder.build()).thenReturn(webClient);

        aiService = new AIService(webClientBuilder, geminiService);
    }

    @Test
    public void testIsCareerRelated_ValidTopics() {
        // Questions that are career-related should be allowed (returns true)
        assertTrue(aiService.isCareerRelated("Làm sao để sửa CV viết bằng tiếng Anh?"));
        assertTrue(aiService.isCareerRelated("Kinh nghiệm phỏng vấn Java Developer ở FPT"));
        assertTrue(aiService.isCareerRelated("Lộ trình trở thành Data Scientist thế nào?"));
        assertTrue(aiService.isCareerRelated("Làm sao đàm phán lương khi nhận offer?"));
    }

    @Test
    public void testIsCareerRelated_BlockedTopics() {
        // Off-topic questions should be blocked (returns false)
        // Dating and personal relationships
        assertFalse(aiService.isCareerRelated("Làm sao để tán đổ đồng nghiệp nữ cùng phòng?"));
        assertFalse(aiService.isCareerRelated("Cách nói chuyện thả thính crush"));

        // Gaming
        assertFalse(aiService.isCareerRelated("Cách leo rank Liên Quân nhanh nhất"));
        assertFalse(aiService.isCareerRelated("Game nào đang hot nhất hiện nay?"));

        // Entertainment & Sports
        assertFalse(aiService.isCareerRelated("Kết quả trận bóng đá hôm qua"));
        assertFalse(aiService.isCareerRelated("Bộ phim rạp nào hay nhất tháng này?"));
    }

    @Test
    public void testIsCareerRelated_EdgeCases() {
        // Null or empty inputs
        assertFalse(aiService.isCareerRelated(null));
        assertFalse(aiService.isCareerRelated("   "));
    }
}
