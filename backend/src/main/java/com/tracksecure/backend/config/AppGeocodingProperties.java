package com.tracksecure.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.geocoding")
public record AppGeocodingProperties(
        boolean enabled,
        String baseUrl,
        String userAgent,
        int connectTimeoutMs,
        int requestTimeoutMs
) {
    public AppGeocodingProperties {
        baseUrl = baseUrl == null || baseUrl.isBlank() ? "https://nominatim.openstreetmap.org" : baseUrl.trim();
        userAgent = userAgent == null || userAgent.isBlank() ? "TrackSecure/1.0" : userAgent.trim();
        connectTimeoutMs = connectTimeoutMs <= 0 ? 2500 : connectTimeoutMs;
        requestTimeoutMs = requestTimeoutMs <= 0 ? 4000 : requestTimeoutMs;
    }
}
