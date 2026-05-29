package com.tracksecure.backend.dto.auth;

import com.tracksecure.backend.domain.Role;

import java.time.Instant;
import java.util.UUID;

public record UserResponse(
        UUID id,
        String name,
        String email,
        String company,
        Role role,
        Instant createdAt,
        Instant lastLoginAt
) {
}
