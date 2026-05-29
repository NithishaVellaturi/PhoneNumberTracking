package com.tracksecure.backend.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tracksecure.backend.api.ApiResponse;
import com.tracksecure.backend.api.ErrorDetails;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private final ObjectMapper objectMapper;
    private final Map<String, RateWindow> windows = new ConcurrentHashMap<>();

    public RateLimitFilter(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        RateLimit rateLimit = resolveRateLimit(request);
        if (rateLimit == null) {
            filterChain.doFilter(request, response);
            return;
        }

        Instant now = Instant.now();
        String windowKey = clientKey(request) + ":" + request.getMethod() + ":" + request.getRequestURI();
        RateWindow window = windows.compute(windowKey, (key, current) -> {
            if (current == null || current.expiresAt().isBefore(now)) {
                return new RateWindow(1, now.plus(rateLimit.window()));
            }
            return new RateWindow(current.count() + 1, current.expiresAt());
        });

        if (window.count() > rateLimit.maxRequests()) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.getWriter().write(objectMapper.writeValueAsString(
                    ApiResponse.failure(
                            "Too many requests. Please wait and try again.",
                            new ErrorDetails("rate_limit_exceeded", Map.of())
                    )
            ));
            return;
        }

        filterChain.doFilter(request, response);
    }

    private RateLimit resolveRateLimit(HttpServletRequest request) {
        String method = request.getMethod();
        String uri = request.getRequestURI();

        if ("POST".equals(method) && ("/api/auth/login".equals(uri) || "/api/auth/register".equals(uri))) {
            return new RateLimit(12, Duration.ofMinutes(5));
        }
        if ("POST".equals(method) && "/api/auth/refresh".equals(uri)) {
            return new RateLimit(30, Duration.ofMinutes(5));
        }
        if ("GET".equals(method) && "/api/track-number".equals(uri)) {
            return new RateLimit(90, Duration.ofMinutes(1));
        }
        if ("POST".equals(method) && "/api/report-spam".equals(uri)) {
            return new RateLimit(40, Duration.ofMinutes(10));
        }

        return null;
    }

    private String clientKey(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private record RateLimit(int maxRequests, Duration window) {
    }

    private record RateWindow(int count, Instant expiresAt) {
    }
}
