package com.tracksecure.backend.security;

import com.tracksecure.backend.domain.Role;

import java.security.Principal;
import java.util.UUID;

public final class AuthenticatedUser implements Principal {

    private final UUID id;
    private final String email;
    private final String displayName;
    private final Role role;

    public AuthenticatedUser(UUID id, String email, String displayName, Role role) {
        this.id = id;
        this.email = email;
        this.displayName = displayName;
        this.role = role;
    }

    public UUID getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getDisplayName() {
        return displayName;
    }

    public Role getRole() {
        return role;
    }

    @Override
    public String getName() {
        return email;
    }
}
