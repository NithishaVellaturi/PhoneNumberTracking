package com.tracksecure.backend.controller;

import com.tracksecure.backend.api.ApiResponse;
import com.tracksecure.backend.dto.auth.AuthSessionResponse;
import com.tracksecure.backend.dto.auth.CsrfTokenResponse;
import com.tracksecure.backend.dto.auth.LoginRequest;
import com.tracksecure.backend.dto.auth.RegisterRequest;
import com.tracksecure.backend.dto.auth.SessionStateResponse;
import com.tracksecure.backend.dto.auth.UserResponse;
import com.tracksecure.backend.security.AuthenticatedUser;
import com.tracksecure.backend.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping("/csrf-token")
    public ApiResponse<CsrfTokenResponse> csrfToken(CsrfToken csrfToken) {
        return ApiResponse.success(
                "CSRF token ready.",
                new CsrfTokenResponse(csrfToken.getToken(), csrfToken.getHeaderName(), csrfToken.getParameterName())
        );
    }

    @GetMapping("/session")
    public ApiResponse<SessionStateResponse> session(@AuthenticationPrincipal AuthenticatedUser principal) {
        if (principal == null) {
            return ApiResponse.success("No active session.", new SessionStateResponse(false, null));
        }

        return ApiResponse.success(
                "Active session found.",
                new SessionStateResponse(true, authService.getProfile(principal))
        );
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserResponse>> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Account created successfully.", authService.register(request)));
    }

    @PostMapping("/login")
    public ApiResponse<AuthSessionResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse response
    ) {
        return ApiResponse.success("Login successful.", authService.login(request, response));
    }

    @PostMapping("/refresh")
    public ApiResponse<AuthSessionResponse> refresh(HttpServletRequest request, HttpServletResponse response) {
        return ApiResponse.success("Session refreshed.", authService.refresh(request, response));
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logout(HttpServletRequest request, HttpServletResponse response) {
        authService.logout(request, response);
        return ApiResponse.success("Logout successful.");
    }

    @GetMapping("/profile")
    public ApiResponse<UserResponse> profile(@AuthenticationPrincipal AuthenticatedUser principal) {
        return ApiResponse.success("Profile loaded.", authService.getProfile(principal));
    }
}
