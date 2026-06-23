package vn.careermate.learningservice.config;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Slf4j
@Configuration
public class FeignClientConfig {

    @Bean
    public RequestInterceptor requestInterceptor() {
        return new RequestInterceptor() {
            @Override
            public void apply(RequestTemplate template) {
                try {
                    ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
                    if (attributes != null) {
                        HttpServletRequest request = attributes.getRequest();
                        String authHeader = request.getHeader("Authorization");
                        if (authHeader != null && authHeader.startsWith("Bearer ")) {
                            template.header("Authorization", authHeader);
                            log.debug("Forwarded JWT token to Feign client for service: {}", template.feignTarget().name());
                        } else {
                            log.warn("No Authorization header found in request to forward to Feign client");
                        }
                    } else {
                        log.warn("No request attributes found - cannot forward JWT token to Feign client");
                    }
                } catch (Exception e) {
                    log.error("Error forwarding JWT token to Feign client: {}", e.getMessage(), e);
                }
            }
        };
    }
}
