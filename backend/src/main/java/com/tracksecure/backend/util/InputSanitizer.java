package com.tracksecure.backend.util;

import org.springframework.stereotype.Component;

import java.util.Locale;

@Component
public class InputSanitizer {

    public String normalizeEmail(String value) {
        return normalizePlainText(value).toLowerCase(Locale.ROOT);
    }

    public String normalizePlainText(String value) {
        if (value == null) {
            return "";
        }

        String sanitized = value
                .replaceAll("[\\p{Cntrl}&&[^\r\n\t]]", "")
                .replace('<', ' ')
                .replace('>', ' ')
                .trim()
                .replaceAll("\\s{2,}", " ");

        return sanitized;
    }

    public String normalizeCountryCode(String value) {
        String normalized = normalizePlainText(value).replaceAll("[^A-Za-z]", "");
        return normalized.isBlank() ? "US" : normalized.toUpperCase(Locale.ROOT);
    }

    public String normalizePhone(String value) {
        return normalizePlainText(value).replaceAll("[^0-9+()\\-\\s]", "");
    }
}
