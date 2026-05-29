package com.tracksecure.backend.dto.dashboard;

import java.util.List;

public record DashboardStatsResponse(
        long totalSearches,
        long spamReports,
        long activeUsers,
        List<DailyAnalyticsPoint> searchAnalytics,
        List<RegionStatistic> regionStatistics,
        List<RecentActivity> recentActivity,
        List<SpamReportSummary> recentReports
) {
}
