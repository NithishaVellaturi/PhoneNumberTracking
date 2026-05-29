package com.tracksecure.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.Locale;

@ConfigurationProperties(prefix = "app.caller-name")
public record AppCallerNameProperties(
        String provider,
        Twilio twilio
) {
    public AppCallerNameProperties {
        provider = provider == null ? "none" : provider.trim().toLowerCase(Locale.ROOT);
        twilio = twilio == null ? new Twilio("", "", 3000) : twilio;
    }

    public boolean isTwilioEnabled() {
        return "twilio".equals(provider)
                && !twilio.accountSid().isBlank()
                && !twilio.authToken().isBlank();
    }

    public record Twilio(
            String accountSid,
            String authToken,
            int timeoutMs
    ) {
        public Twilio {
            accountSid = accountSid == null ? "" : accountSid.trim();
            authToken = authToken == null ? "" : authToken.trim();
            timeoutMs = timeoutMs <= 0 ? 3000 : timeoutMs;
        }
    }
}
