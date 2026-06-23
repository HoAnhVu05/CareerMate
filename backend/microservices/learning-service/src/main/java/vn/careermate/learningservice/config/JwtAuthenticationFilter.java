package vn.careermate.learningservice.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        // Log ALL POST requests for debugging
        if ("POST".equalsIgnoreCase(request.getMethod())) {
            log.info("=== ===== POST REQUEST RECEIVED ===== ===");
            log.info("Path: {}", request.getRequestURI());
            log.info("Method: {}", request.getMethod());
            log.info("Query String: {}", request.getQueryString());
            java.util.Enumeration<String> headerNames = request.getHeaderNames();
            log.info("All Headers:");
            while (headerNames.hasMoreElements()) {
                String headerName = headerNames.nextElement();
                String headerValue = request.getHeader(headerName);
                if (headerName.equalsIgnoreCase("Authorization")) {
                    log.info("  {}: {}", headerName, headerValue != null && headerValue.length() > 20 ? headerValue.substring(0, 20) + "..." : headerValue);
                } else {
                    log.info("  {}: {}", headerName, headerValue);
                }
            }
        }
        
        // Log ALL requests to /courses/*/quiz/submit for debugging
        if (request.getRequestURI().contains("/quiz/submit")) {
            log.info("=== ===== INCOMING REQUEST TO QUIZ SUBMIT ===== ===");
            log.info("Path: {}", request.getRequestURI());
            log.info("Method: {}", request.getMethod());
            log.info("Query String: {}", request.getQueryString());
            java.util.Enumeration<String> headerNames = request.getHeaderNames();
            log.info("All Headers:");
            while (headerNames.hasMoreElements()) {
                String headerName = headerNames.nextElement();
                String headerValue = request.getHeader(headerName);
                if (headerName.equalsIgnoreCase("Authorization")) {
                    log.info("  {}: {}", headerName, headerValue != null && headerValue.length() > 20 ? headerValue.substring(0, 20) + "..." : headerValue);
                } else {
                    log.info("  {}: {}", headerName, headerValue);
                }
            }
        }
        
        // Log all incoming requests for debugging
        if (request.getRequestURI().contains("/challenges") || request.getRequestURI().contains("/quiz")) {
            log.info("=== INCOMING REQUEST ===");
            log.info("Path: {}", request.getRequestURI());
            log.info("Method: {}", request.getMethod());
            java.util.Enumeration<String> headerNames = request.getHeaderNames();
            log.info("Headers:");
            while (headerNames.hasMoreElements()) {
                String headerName = headerNames.nextElement();
                if (headerName.equalsIgnoreCase("Authorization")) {
                    String authValue = request.getHeader(headerName);
                    log.info("  {}: {}", headerName, authValue != null && authValue.length() > 20 ? authValue.substring(0, 20) + "..." : authValue);
                } else {
                    log.info("  {}: {}", headerName, request.getHeader(headerName));
                }
            }
        }
        
        final String authHeader = request.getHeader("Authorization");
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            if (request.getRequestURI().contains("/quiz/submit")) {
                log.error("=== 401 ERROR: No Authorization header or not Bearer token ===");
                log.error("Path: {}", request.getRequestURI());
                log.error("Method: {}", request.getMethod());
                log.error("All headers: {}", java.util.Collections.list(request.getHeaderNames()));
            } else {
                log.warn("No Authorization header or not Bearer token for path: {}", request.getRequestURI());
            }
            // Don't return early - let Spring Security handle authentication failure
            // This allows @PreAuthorize to work properly
        } else {
            // Authorization header exists, process it
            try {
                final String jwt = authHeader.substring(7);
                if (request.getRequestURI().contains("/quiz/submit")) {
                    log.info("=== PROCESSING JWT FOR QUIZ SUBMIT ===");
                    log.info("Path: {}", request.getRequestURI());
                    log.info("JWT token length: {}", jwt.length());
                } else {
                    log.info("Processing JWT token for path: {}", request.getRequestURI());
                }
                
                final String username = jwtService.extractUsername(jwt);
                final String role = jwtService.extractRole(jwt);
                
                if (request.getRequestURI().contains("/quiz/submit")) {
                    log.info("Extracted username: {}, role: {}", username, role);
                } else {
                    log.info("Extracted username: {}, role: {}", username, role);
                }

                if (username == null) {
                    log.error("Username is null from JWT token for path: {}", request.getRequestURI());
                } else if (SecurityContextHolder.getContext().getAuthentication() == null) {
                    if (jwtService.validateToken(jwt, username)) {
                        // Default to USER role if role is null (for backward compatibility with old tokens)
                        String roleStr = (role != null && !role.isEmpty()) ? role : "USER";
                        List<SimpleGrantedAuthority> authorities = Collections.singletonList(
                                new SimpleGrantedAuthority("ROLE_" + roleStr)
                        );
                        
                        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                                username,
                                null,
                                authorities
                        );
                        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authToken);
                        
                        if (request.getRequestURI().contains("/quiz/submit")) {
                            log.info("=== AUTHENTICATION SET SUCCESSFULLY ===");
                            log.info("User: {}", username);
                            log.info("Role: {} (authority: ROLE_{})", roleStr, roleStr);
                            log.info("Authorities: {}", authorities);
                        } else {
                            log.info("Authentication set successfully for user: {} with role: {} (authority: ROLE_{})", username, roleStr, roleStr);
                        }
                    } else {
                        log.error("JWT token validation failed for username: {} on path: {}", username, request.getRequestURI());
                    }
                } else {
                    // Log existing authentication for debugging
                    org.springframework.security.core.Authentication existingAuth = SecurityContextHolder.getContext().getAuthentication();
                    if (request.getRequestURI().contains("/quiz/submit")) {
                        log.info("=== AUTHENTICATION ALREADY EXISTS ===");
                        log.info("User: {}", existingAuth.getName());
                        log.info("Authorities: {}", existingAuth.getAuthorities());
                    } else {
                        log.debug("Authentication already exists for path: {} - User: {}, Authorities: {}", 
                            request.getRequestURI(), 
                            existingAuth.getName(),
                            existingAuth.getAuthorities());
                    }
                }
            } catch (Exception e) {
                log.error("=== ERROR SETTING AUTHENTICATION FOR {} ===", request.getRequestURI());
                log.error("Exception: {}", e.getMessage(), e);
                e.printStackTrace();
                // Continue filter chain even if JWT parsing fails - let Spring Security handle it
            }
        }

        filterChain.doFilter(request, response);
    }
}
