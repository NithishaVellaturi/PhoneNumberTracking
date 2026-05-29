package com.tracksecure.backend.dto.auth;

public record SessionStateResponse(boolean authenticated, UserResponse user) {
}
