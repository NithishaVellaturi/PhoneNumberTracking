package com.tracksecure.backend.dto.tracking;

import com.tracksecure.backend.domain.RiskLevel;

import java.time.Instant;

public record TrackNumberResponse(
        String phoneNumber,
        String countryCode,
        String countryName,
        boolean savedNumber,
        String savedCallerName,
        String businessCallerName,
        String operator,
        String region,
        String lineType,
        int spamScore,
        long reportCount,
        RiskLevel riskLevel,
        Instant lastChecked
) {
}
