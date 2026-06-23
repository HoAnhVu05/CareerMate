package vn.careermate.adminservice.config;

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
        final String requestPath = request.getRequestURI();
        
        log.info("=== JWT Filter - Processing request: {} ===", requestPath);
        log.info("Authorization header present: {}", authHeader != null);
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.warn("No valid Authorization header for path: {}", requestPath);
            filterChain.doFilter(request, response);
            return;
        }

        try {
            final String jwt = authHeader.substring(7);
            log.info("JWT Token (first 20 chars): {}...", jwt.substring(0, Math.min(20, jwt.length())));
            
            final String username = jwtService.extractUsername(jwt);
            final String role = jwtService.extractRole(jwt);
            
            log.info("Extracted username: {}", username);
            log.info("Extracted role: {}", role);

            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                if (jwtService.validateToken(jwt, username)) {
                    String finalRole = (role != null && !role.isEmpty()) ? role : "USER";
                    List<SimpleGrantedAuthority> authorities = Collections.singletonList(
                            new SimpleGrantedAuthority("ROLE_" + finalRole)
                    );
                    
                    log.info("Creating authority: ROLE_{}", finalRole);
                    log.info("Token validated successfully for user: {}", username);
                    
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            username,
                            null,
                            authorities
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    
                    log.info("Authentication set successfully - User: {}, Role: ROLE_{}", username, finalRole);
                } else {
                    log.error("Token validation FAILED for username: {}", username);
                }
            } else {
                if (username == null) {
                    log.error("Username extraction returned NULL from token");
                }
                if (SecurityContextHolder.getContext().getAuthentication() != null) {
                    log.debug("Authentication already exists in SecurityContext");
                }
            }
        } catch (Exception e) {
            log.error("JWT Filter Exception on path {}: {}", requestPath, e.getMessage(), e);
        }

        filterChain.doFilter(request, response);
    }
}
