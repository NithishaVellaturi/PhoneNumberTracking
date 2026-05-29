package com.tracksecure.backend.service;

import com.tracksecure.backend.config.AppSecurityProperties;
import com.tracksecure.backend.domain.RefreshToken;
import com.tracksecure.backend.domain.UserAccount;
import com.tracksecure.backend.exception.ApiException;
import com.tracksecure.backend.repository.RefreshTokenRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.HexFormat;

@Service
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final Duration refreshTokenDuration;
    private final SecureRandom secureRandom = new SecureRandom();

    public RefreshTokenService(
            RefreshTokenRepository refreshTokenRepository,
            AppSecurityProperties properties
    ) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.refreshTokenDuration = Duration.ofDays(properties.refreshTokenDays());
    }

    public IssuedRefreshToken issue(UserAccount user, Instant issuedAt) {
        revokeActiveTokens(user, issuedAt);

        String rawToken = generateTokenValue();
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setTokenHash(hash(rawToken));
        refreshToken.setCreatedAt(issuedAt);
        refreshToken.setExpiresAt(issuedAt.plus(refreshTokenDuration));
        refreshTokenRepository.save(refreshToken);

        return new IssuedRefreshToken(rawToken, refreshToken.getExpiresAt());
    }

    public RotatedRefreshToken rotate(String rawToken, Instant now) {
        RefreshToken currentToken = requireActiveToken(rawToken, now);
        currentToken.setLastUsedAt(now);
        currentToken.setRevokedAt(now);
        refreshTokenRepository.save(currentToken);

        IssuedRefreshToken newToken = issue(currentToken.getUser(), now);
        return new RotatedRefreshToken(currentToken.getUser(), newToken);
    }

    public void revoke(String rawToken, Instant now) {
        if (rawToken == null || rawToken.isBlank()) {
            return;
        }

        refreshTokenRepository.findByTokenHash(hash(rawToken)).ifPresent(token -> {
            if (!token.isRevoked() && token.getExpiresAt().isAfter(now)) {
                token.setRevokedAt(now);
                refreshTokenRepository.save(token);
            }
        });
    }

    private void revokeActiveTokens(UserAccount user, Instant now) {
        refreshTokenRepository.findByUserIdAndRevokedAtIsNullAndExpiresAtAfter(user.getId(), now).forEach(token -> {
            token.setRevokedAt(now);
            refreshTokenRepository.save(token);
        });
    }

    private RefreshToken requireActiveToken(String rawToken, Instant now) {
        return refreshTokenRepository.findByTokenHash(hash(rawToken))
                .filter(token -> !token.isRevoked() && token.getExpiresAt().isAfter(now))
                .orElseThrow(() -> new ApiException(
                        HttpStatus.UNAUTHORIZED,
                        "invalid_refresh_token",
                        "Your session has expired. Please sign in again."
                ));
    }

    private String generateTokenValue() {
        byte[] buffer = new byte[48];
        secureRandom.nextBytes(buffer);
        return HexFormat.of().formatHex(buffer);
    }

    private String hash(String value) {
        try {
            MessageDigest messageDigest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(messageDigest.digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception exception) {
            throw new IllegalStateException("Failed to hash refresh token", exception);
        }
    }

    public record IssuedRefreshToken(String rawToken, Instant expiresAt) {
    }

    public record RotatedRefreshToken(UserAccount user, IssuedRefreshToken issuedToken) {
    }
}
