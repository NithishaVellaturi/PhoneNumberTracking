package com.tracksecure.backend.dto.dashboard;

import com.tracksecure.backend.domain.RiskLevel;

import java.time.Instant;

public record SpamReportSummary(
        String phoneNumber,
        long reportCount,
        String mostRecentReason,
        int spamScore,
        RiskLevel riskLevel,
        Instant lastReportedAt
) {
}
