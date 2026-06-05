package com.tracksecure.backend.dto.phone;

public record MapBoundsResponse(
        double southLatitude,
        double northLatitude,
        double westLongitude,
        double eastLongitude
) {
}
