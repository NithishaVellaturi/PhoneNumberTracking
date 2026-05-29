package com.tracksecure.backend.security;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tracksecure.backend.config.AppSecurityProperties;
import com.tracksecure.backend.domain.UserAccount;
import com.tracksecure.backend.exception.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class JwtService {

    private static final TypeReference<Map<String, Object>> MAP_TYPE = new TypeReference<>() {
    };

    private final ObjectMapper objectMapper;
    private final byte[] signingKey;
    private final Duration accessTokenDuration;

    public JwtService(ObjectMapper objectMapper, AppSecurityProperties properties) {
        this.objectMapper = objectMapper;
        this.signingKey = properties.jwtSecret().getBytes(StandardCharsets.UTF_8);
        this.accessTokenDuration = Duration.ofMinutes(properties.accessTokenMinutes());
    }

    public JwtToken createAccessToken(UserAccount user, Instant issuedAt) {
        Instant expiresAt = issuedAt.plus(accessTokenDuration);
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("iss", "tracksecure");
        payload.put("sub", user.getId().toString());
        payload.put("email", user.getEmail());
        payload.put("name", user.getName());
        payload.put("role", user.getRole().name());
        payload.put("iat", issuedAt.getEpochSecond());
        payload.put("exp", expiresAt.getEpochSecond());

        return new JwtToken(buildToken(payload), expiresAt);
    }

    public JwtClaims parse(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3) {
                throw invalidToken();
            }

            String payloadJson = new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);
            String expectedSignature = sign(parts[0] + "." + parts[1]);
            if (!expectedSignature.equals(parts[2])) {
                throw invalidToken();
            }

            Map<String, Object> claims = objectMapper.readValue(payloadJson, MAP_TYPE);
            Instant expiresAt = Instant.ofEpochSecond(((Number) claims.get("exp")).longValue());
            if (expiresAt.isBefore(Instant.now())) {
                throw new ApiException(HttpStatus.UNAUTHORIZED, "token_expired", "Your session has expired.");
            }

            return new JwtClaims(
                    UUID.fromString(String.valueOf(claims.get("sub"))),
                    String.valueOf(claims.get("email")),
                    String.valueOf(claims.get("name")),
                    Enum.valueOf(com.tracksecure.backend.domain.Role.class, String.valueOf(claims.get("role"))),
                    expiresAt
            );
        } catch (ApiException exception) {
            throw exception;
        } catch (Exception exception) {
            throw invalidToken();
        }
    }

    private String buildToken(Map<String, Object> payload) {
        try {
            String header = base64Url(objectMapper.writeValueAsBytes(Map.of("alg", "HS256", "typ", "JWT")));
            String body = base64Url(objectMapper.writeValueAsBytes(payload));
            return header + "." + body + "." + sign(header + "." + body);
        } catch (Exception exception) {
            throw new IllegalStateException("Failed to create JWT token", exception);
        }
    }

    private String sign(String value) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(signingKey, "HmacSHA256"));
            return base64Url(mac.doFinal(value.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception exception) {
            throw new IllegalStateException("Failed to sign JWT token", exception);
        }
    }

    private String base64Url(byte[] value) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(value);
    }

    private ApiException invalidToken() {
        return new ApiException(HttpStatus.UNAUTHORIZED, "invalid_token", "Your session is invalid. Please sign in again.");
    }
}
