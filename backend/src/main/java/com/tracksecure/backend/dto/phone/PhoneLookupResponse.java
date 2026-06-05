package com.tracksecure.backend.dto.phone;

import com.tracksecure.backend.domain.LocationPrecision;
import com.tracksecure.backend.domain.LookupStatus;
import com.tracksecure.backend.domain.RiskLevel;

import java.time.Instant;
import java.util.List;

public record PhoneLookupResponse(
        String number,
        String country,
        String countryFlag,
        String countryCode,
        String region,
        String carrier,
        String lineType,
        String timezone,
        String estimatedLocation,
        int spamScore,
        RiskLevel riskLevel,
        LookupStatus status,
        boolean valid,
        double estimatedLatitude,
        double estimatedLongitude,
        LocationPrecision locationPrecision,
        MapBoundsResponse mapBounds,
        Instant lastLookupDate,
        List<LookupHistoryItem> lookupHistory
) {
}
