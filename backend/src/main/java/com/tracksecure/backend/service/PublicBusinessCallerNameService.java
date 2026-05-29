package com.tracksecure.backend.service;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tracksecure.backend.config.AppCallerNameProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Base64;
import java.util.Locale;

@Service
public class PublicBusinessCallerNameService {

    private static final Logger logger = LoggerFactory.getLogger(PublicBusinessCallerNameService.class);

    private final AppCallerNameProperties properties;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public PublicBusinessCallerNameService(AppCallerNameProperties properties, ObjectMapper objectMapper) {
        this.properties = properties;
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofMillis(properties.twilio().timeoutMs()))
                .build();
    }

    public BusinessCallerNameLookupResult lookupBusinessCallerName(String normalizedPhoneNumber, String countryName) {
        if (!properties.isTwilioEnabled()) {
            return BusinessCallerNameLookupResult.UNAVAILABLE;
        }

        if (!"united states".equalsIgnoreCase(countryName.trim())) {
            return BusinessCallerNameLookupResult.UNAVAILABLE;
        }

        String encodedPhoneNumber = URLEncoder.encode(normalizedPhoneNumber, StandardCharsets.UTF_8);
        String credentials = properties.twilio().accountSid() + ":" + properties.twilio().authToken();
        String authorization = Base64.getEncoder().encodeToString(credentials.getBytes(StandardCharsets.UTF_8));

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://lookups.twilio.com/v2/PhoneNumbers/" + encodedPhoneNumber + "?Fields=caller_name"))
                .timeout(Duration.ofMillis(properties.twilio().timeoutMs()))
                .header("Authorization", "Basic " + authorization)
                .header("Accept", "application/json")
                .GET()
                .build();

        try {
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                logger.warn("Caller name lookup failed with status {}", response.statusCode());
                return BusinessCallerNameLookupResult.UNAVAILABLE;
            }

            TwilioLookupResponse lookupResponse = objectMapper.readValue(response.body(), TwilioLookupResponse.class);
            if (lookupResponse.callerName() == null) {
                return BusinessCallerNameLookupResult.UNAVAILABLE;
            }

            String callerType = lookupResponse.callerName().callerType();
            String callerName = lookupResponse.callerName().callerName();
            if (!"BUSINESS".equalsIgnoreCase(callerType) || callerName == null || callerName.isBlank()) {
                return BusinessCallerNameLookupResult.UNAVAILABLE;
            }

            return new BusinessCallerNameLookupResult(callerName.trim());
        } catch (IOException exception) {
            logger.warn("Caller name lookup request failed: {}", exception.getMessage());
            return BusinessCallerNameLookupResult.UNAVAILABLE;
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            logger.warn("Caller name lookup request was interrupted.");
            return BusinessCallerNameLookupResult.UNAVAILABLE;
        }
    }

    private record TwilioLookupResponse(
            @JsonProperty("caller_name")
            TwilioCallerName callerName
    ) {
    }

    private record TwilioCallerName(
            @JsonProperty("caller_name")
            String callerName,
            @JsonProperty("caller_type")
            String callerType
    ) {
    }
}
