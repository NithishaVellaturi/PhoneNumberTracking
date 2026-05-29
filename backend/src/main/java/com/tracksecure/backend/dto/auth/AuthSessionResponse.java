package com.tracksecure.backend.dto.auth;

import java.time.Instant;

public record AuthSessionResponse(UserResponse user, Instant expiresAt) {
}
