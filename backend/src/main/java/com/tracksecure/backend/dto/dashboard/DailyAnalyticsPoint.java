package com.tracksecure.backend.dto.dashboard;

public record DailyAnalyticsPoint(String day, long searches, long spamReports) {
}
