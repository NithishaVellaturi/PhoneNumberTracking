package com.tracksecure.backend.dto.dashboard;

import com.tracksecure.backend.dto.phone.LookupHistoryItem;

import java.util.List;

public record DashboardTrendsResponse(
        List<DailyAnalyticsPoint> lookupTrends,
        List<NamedMetric> topCountries,
        List<NamedMetric> topCarriers,
        List<NamedMetric> riskDistribution,
        List<NamedMetric> lineTypeDistribution,
        List<LookupHistoryItem> recentLookups
) {
}
