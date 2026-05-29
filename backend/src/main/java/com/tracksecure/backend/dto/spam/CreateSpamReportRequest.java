package com.tracksecure.backend.dto.spam;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateSpamReportRequest(
        @NotBlank(message = "Phone number is required")
        String phoneNumber,
        @Size(max = 8, message = "Country code must be 8 characters or fewer")
        String countryCode,
        @NotBlank(message = "Reason is required")
        @Size(min = 4, max = 120, message = "Reason must be between 4 and 120 characters")
        String reason,
        @Size(max = 500, message = "Notes must be 500 characters or fewer")
        String notes
) {
}
