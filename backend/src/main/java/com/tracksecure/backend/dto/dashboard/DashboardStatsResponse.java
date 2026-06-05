package com.tracksecure.backend.dto.dashboard;

import java.util.List;

public record DashboardStatsResponse(
        long totalSearches,
        long searchesToday,
        long spamReports,
        long validLookups,
        long invalidLookups,
        double averageSpamScore,
        List<NamedMetric> topCountries,
        List<NamedMetric> topCarriers
) {
}
