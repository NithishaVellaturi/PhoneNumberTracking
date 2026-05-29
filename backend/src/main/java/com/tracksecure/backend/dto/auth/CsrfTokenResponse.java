package com.tracksecure.backend.dto.auth;

public record CsrfTokenResponse(String token, String headerName, String parameterName) {
}
