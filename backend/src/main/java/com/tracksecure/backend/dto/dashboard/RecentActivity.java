package com.tracksecure.backend.dto.dashboard;

import java.time.Instant;

public record RecentActivity(String title, String description, String type, Instant occurredAt) {
}
