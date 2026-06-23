package vn.careermate.gateway.filter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class LoggingFilter implements GlobalFilter, Ordered {
    
    private static final Logger log = LoggerFactory.getLogger(LoggingFilter.class);

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        
        // Log quiz submit requests
        if (request.getURI().getPath().contains("/quiz/submit")) {
            log.info("=== API GATEWAY: QUIZ SUBMIT REQUEST ===");
            log.info("Path: {}", request.getURI().getPath());
            log.info("Method: {}", request.getMethod());
            log.info("Headers:");
            request.getHeaders().forEach((name, values) -> {
                if (name.equalsIgnoreCase("Authorization")) {
                    String value = values.isEmpty() ? "" : values.get(0);
                    log.info("  {}: {}", name, value != null && value.length() > 20 ? value.substring(0, 20) + "..." : value);
                } else {
                    log.info("  {}: {}", name, values);
                }
            });
        }
        
        return chain.filter(exchange);
    }

    @Override
    public int getOrder() {
        return -1; // Run early
    }
}
