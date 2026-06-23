package vn.careermate.notificationservice.config;

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
        
        final String authHeader = request.getHeader("Authorization");
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.debug("No Authorization header or not Bearer token for path: {}", request.getRequestURI());
            filterChain.doFilter(request, response);
            return;
        }

        try {
            final String jwt = authHeader.substring(7);
            log.info("Processing JWT token for path: {}", request.getRequestURI());
            
            final String username = jwtService.extractUsername(jwt);
            final String role = jwtService.extractRole(jwt);
            
            log.info("Extracted username: {}, role: {}", username, role);

            if (username == null) {
                log.warn("Username is null from JWT token");
                filterChain.doFilter(request, response);
                return;
            }

            if (SecurityContextHolder.getContext().getAuthentication() == null) {
                if (jwtService.validateToken(jwt, username)) {
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
                    log.info("Authentication set successfully for user: {} with role: {}", username, roleStr);
                } else {
                    log.warn("JWT token validation failed for username: {}", username);
                }
            } else {
                log.debug("Authentication already exists for path: {}", request.getRequestURI());
            }
        } catch (Exception e) {
            log.error("Cannot set user authentication for path {}: {}", request.getRequestURI(), e.getMessage(), e);
            e.printStackTrace();
            // Continue filter chain even if JWT parsing fails - let Spring Security handle it
        }

        filterChain.doFilter(request, response);
    }
}
