package com.tracksecure.backend.security;

import com.tracksecure.backend.domain.Role;

import java.time.Instant;
import java.util.UUID;

public record JwtClaims(UUID userId, String email, String name, Role role, Instant expiresAt) {
}
