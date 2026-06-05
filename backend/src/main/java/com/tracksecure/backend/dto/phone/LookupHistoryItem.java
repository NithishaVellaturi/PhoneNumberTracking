package com.tracksecure.backend.dto.phone;

import com.tracksecure.backend.domain.LookupStatus;
import com.tracksecure.backend.domain.RiskLevel;

import java.time.Instant;

public record LookupHistoryItem(
        String phoneNumber,
        String country,
        String region,
        String carrier,
        String lineType,
        int spamScore,
        RiskLevel riskLevel,
        LookupStatus status,
        Instant searchedAt
) {
}
