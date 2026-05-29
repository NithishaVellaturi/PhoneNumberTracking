package com.tracksecure.backend.service;

import com.tracksecure.backend.config.AppSecurityProperties;
import com.tracksecure.backend.domain.Role;
import com.tracksecure.backend.domain.UserAccount;
import com.tracksecure.backend.dto.auth.AuthSessionResponse;
import com.tracksecure.backend.dto.auth.LoginRequest;
import com.tracksecure.backend.dto.auth.RegisterRequest;
import com.tracksecure.backend.dto.auth.UserResponse;
import com.tracksecure.backend.exception.ApiException;
import com.tracksecure.backend.repository.UserRepository;
import com.tracksecure.backend.security.AuthenticatedUser;
import com.tracksecure.backend.security.JwtService;
import com.tracksecure.backend.security.JwtToken;
import com.tracksecure.backend.security.SecurityCookieNames;
import com.tracksecure.backend.util.InputSanitizer;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final InputSanitizer inputSanitizer;
    private final AppSecurityProperties securityProperties;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            RefreshTokenService refreshTokenService,
            InputSanitizer inputSanitizer,
            AppSecurityProperties securityProperties
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
        this.inputSanitizer = inputSanitizer;
        this.securityProperties = securityProperties;
    }

    public UserResponse register(RegisterRequest request) {
        String email = inputSanitizer.normalizeEmail(request.email());
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ApiException(HttpStatus.CONFLICT, "email_exists", "An account with this email already exists.");
        }

        UserAccount user = new UserAccount();
        user.setName(inputSanitizer.normalizePlainText(request.name()));
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setCompany(inputSanitizer.normalizePlainText(request.company()));
        user.setRole(Role.USER);

        return toUserResponse(userRepository.save(user));
    }

    public AuthSessionResponse login(
            LoginRequest request,
            HttpServletResponse response
    ) {
        String email = inputSanitizer.normalizeEmail(request.email());
        UserAccount user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "invalid_credentials", "Incorrect email or password."));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "invalid_credentials", "Incorrect email or password.");
        }

        Instant now = Instant.now();
        user.setLastLoginAt(now);
        userRepository.save(user);

        return establishSession(user, response, now);
    }

    public AuthSessionResponse refresh(HttpServletRequest request, HttpServletResponse response) {
        String refreshToken = readCookie(request, SecurityCookieNames.REFRESH);
        Instant now = Instant.now();
        RefreshTokenService.RotatedRefreshToken rotatedRefreshToken = refreshTokenService.rotate(refreshToken, now);
        return establishSession(rotatedRefreshToken.user(), response, now, rotatedRefreshToken.issuedToken());
    }

    public void logout(HttpServletRequest request, HttpServletResponse response) {
        refreshTokenService.revoke(readCookie(request, SecurityCookieNames.REFRESH), Instant.now());
        clearCookie(response, SecurityCookieNames.SESSION);
        clearCookie(response, SecurityCookieNames.REFRESH);
    }

    public UserResponse getProfile(AuthenticatedUser principal) {
        UserAccount user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "invalid_session", "User session is no longer valid."));
        return toUserResponse(user);
    }

    private AuthSessionResponse establishSession(
            UserAccount user,
            HttpServletResponse response,
            Instant now
    ) {
        RefreshTokenService.IssuedRefreshToken refreshToken = refreshTokenService.issue(user, now);
        return establishSession(user, response, now, refreshToken);
    }

    private AuthSessionResponse establishSession(
            UserAccount user,
            HttpServletResponse response,
            Instant now,
            RefreshTokenService.IssuedRefreshToken refreshToken
    ) {
        JwtToken jwtToken = jwtService.createAccessToken(user, now);
        addCookie(response, SecurityCookieNames.SESSION, jwtToken.token(), Duration.between(now, jwtToken.expiresAt()), true);
        addCookie(response, SecurityCookieNames.REFRESH, refreshToken.rawToken(), Duration.between(now, refreshToken.expiresAt()), true);
        return new AuthSessionResponse(toUserResponse(user), jwtToken.expiresAt());
    }

    private void addCookie(
            HttpServletResponse response,
            String name,
            String value,
            Duration maxAge,
            boolean httpOnly
    ) {
        ResponseCookie cookie = ResponseCookie.from(name, value)
                .httpOnly(httpOnly)
                .secure(securityProperties.cookieSecure())
                .path("/")
                .sameSite(securityProperties.cookieSameSite())
                .maxAge(maxAge)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private void clearCookie(HttpServletResponse response, String name) {
        ResponseCookie cookie = ResponseCookie.from(name, "")
                .httpOnly(true)
                .secure(securityProperties.cookieSecure())
                .path("/")
                .sameSite(securityProperties.cookieSameSite())
                .maxAge(Duration.ZERO)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private String readCookie(HttpServletRequest request, String name) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "invalid_session", "Your session has expired. Please sign in again.");
        }

        for (Cookie cookie : cookies) {
            if (name.equals(cookie.getName()) && cookie.getValue() != null && !cookie.getValue().isBlank()) {
                return cookie.getValue();
            }
        }

        throw new ApiException(HttpStatus.UNAUTHORIZED, "invalid_session", "Your session has expired. Please sign in again.");
    }

    private UserResponse toUserResponse(UserAccount user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getCompany(),
                user.getRole(),
                user.getCreatedAt(),
                user.getLastLoginAt()
        );
    }
}
