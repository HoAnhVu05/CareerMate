package vn.careermate.userservice.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");
        final String requestPath = request.getRequestURI();
        
        System.err.println("CRITICAL: Filter Incoming Path: " + requestPath);
        
        // Skip JWT processing for public endpoints
        if (requestPath.contains("/auth/") || requestPath.contains("/api/auth/") || 
            requestPath.contains("/uploads/") || requestPath.contains("/api/uploads/")) {
            System.err.println("CRITICAL: Filter skipping JWT for path: " + requestPath);
            filterChain.doFilter(request, response);
            return;
        }
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            // No token provided - let Spring Security handle it (will reject if endpoint requires auth)
            filterChain.doFilter(request, response);
            return;
        }

        try {
            final String jwt = authHeader.substring(7);
            final String userEmail = jwtService.extractUsername(jwt);

            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);
                
                if (jwtService.isTokenValid(jwt, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    
                    logger.debug("JWT Filter - Authentication set successfully for user: " + userEmail + " on path: " + requestPath);
                } else {
                    logger.warn("JWT Filter - Token is invalid for user: " + userEmail + " on path: " + requestPath);
                }
            }
        } catch (Exception e) {
            logger.error("JWT Filter - Cannot set user authentication for path: " + requestPath, e);
            // Continue filter chain - let Spring Security handle the rejection
        }

        filterChain.doFilter(request, response);
    }
}
