package com.tracksecure.backend.service;

import com.tracksecure.backend.domain.RiskLevel;
import com.tracksecure.backend.dto.tracking.TrackNumberResponse;

import java.time.Instant;

public record PhoneLookupResult(
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
    public TrackNumberResponse toResponse() {
        return new TrackNumberResponse(
                phoneNumber,
                countryCode,
                countryName,
                savedNumber,
                savedCallerName,
                businessCallerName,
                operator,
                region,
                lineType,
                spamScore,
                reportCount,
                riskLevel,
                lastChecked
        );
    }
}
