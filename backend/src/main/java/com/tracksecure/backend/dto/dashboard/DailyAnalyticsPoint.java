package com.tracksecure.backend.dto.dashboard;

public record DailyAnalyticsPoint(String date, long totalSearches, long spamReports) {
}
