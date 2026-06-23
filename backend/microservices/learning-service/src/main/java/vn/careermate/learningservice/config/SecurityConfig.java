package vn.careermate.learningservice.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import jakarta.servlet.http.HttpServletResponse;

@Slf4j
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/actuator/**").permitAll()
                .requestMatchers("/courses", "/courses/free", "/courses/{courseId}").permitAll() // Public course endpoints
                .requestMatchers("/quizzes/**").permitAll()
                .requestMatchers("/challenges").permitAll() // Public challenge list
                .requestMatchers("/cv-templates/**").permitAll()
                .requestMatchers("/packages").permitAll() // Public package list
                // IMPORTANT: Allow all requests to pass through - @PreAuthorize will handle authorization
                // This ensures JWT filter runs first
                .anyRequest().permitAll()
            )
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint((request, response, authException) -> {
                    if (request.getRequestURI().contains("/quiz/submit")) {
                        log.error("=== 401 UNAUTHORIZED FOR QUIZ SUBMIT ===");
                        log.error("Path: {}", request.getRequestURI());
                        log.error("Method: {}", request.getMethod());
                        log.error("Exception: {}", authException.getMessage());
                        log.error("Authorization header: {}", request.getHeader("Authorization") != null ? "Present" : "Missing");
                        org.springframework.security.core.Authentication auth = 
                            org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
                        log.error("Current authentication: {}", auth != null ? auth.toString() : "null");
                    } else {
                        log.warn("Authentication failed for path: {} - {}", request.getRequestURI(), authException.getMessage());
                    }
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"error\":\"Unauthorized\",\"message\":\"Authentication required. Please login first.\"}");
                })
                .accessDeniedHandler((request, response, accessDeniedException) -> {
                    org.springframework.security.core.Authentication auth = 
                        org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
                    if (request.getRequestURI().contains("/quiz/submit")) {
                        log.error("=== 403 FORBIDDEN FOR QUIZ SUBMIT ===");
                        log.error("Path: {}", request.getRequestURI());
                        log.error("User: {}", auth != null ? auth.getName() : "null");
                        log.error("Authorities: {}", auth != null ? auth.getAuthorities() : "null");
                        log.error("Exception: {}", accessDeniedException.getMessage());
                        log.error("Required: ROLE_STUDENT");
                    } else {
                        log.warn("Access denied for path: {} - User: {}, Authorities: {}, Exception: {}", 
                            request.getRequestURI(),
                            auth != null ? auth.getName() : "null",
                            auth != null ? auth.getAuthorities() : "null",
                            accessDeniedException.getMessage());
                    }
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"error\":\"Forbidden\",\"message\":\"Access denied. You don't have permission to access this resource. Required role: STUDENT\"}");
                })
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
