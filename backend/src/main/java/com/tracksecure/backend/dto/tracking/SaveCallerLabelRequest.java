package com.tracksecure.backend.dto.tracking;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SaveCallerLabelRequest(
        @NotBlank(message = "Phone number is required")
        String phoneNumber,
        @Size(max = 8, message = "Country code must be 8 characters or fewer")
        String countryCode,
        @Size(max = 120, message = "Caller name must be 120 characters or fewer")
        String callerName
) {
}
