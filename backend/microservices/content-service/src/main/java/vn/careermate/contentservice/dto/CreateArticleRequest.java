package vn.careermate.contentservice.dto;

import lombok.Data;
import java.util.List;

@Data
public class CreateArticleRequest {
    private String title;
    private String content;
    private String excerpt;
    private String category;
    private List<String> tags;
    private String thumbnailUrl;
}
