package com.tracksecure.backend.service;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tracksecure.backend.config.AppGeocodingProperties;
import com.tracksecure.backend.domain.LocationPrecision;
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
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class GeoCodingService {

    private static final Logger logger = LoggerFactory.getLogger(GeoCodingService.class);

    private final AppGeocodingProperties properties;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;
    private final Map<String, GeoLocation> cache = new ConcurrentHashMap<>();

    public GeoCodingService(AppGeocodingProperties properties, ObjectMapper objectMapper) {
        this.properties = properties;
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofMillis(properties.connectTimeoutMs()))
                .build();
    }

    public GeoLocation resolve(String region, String country, String regionCode) {
        String query = buildQuery(region, country);
        if (query.isBlank()) {
            return fallback(region, country, regionCode);
        }

        String cacheKey = query.toLowerCase(Locale.ROOT);
        return cache.computeIfAbsent(cacheKey, key -> geocode(query, region, country, regionCode));
    }

    private GeoLocation geocode(String query, String region, String country, String regionCode) {
        if (!properties.enabled()) {
            return fallback(region, country, regionCode);
        }

        try {
            String encodedQuery = URLEncoder.encode(query, StandardCharsets.UTF_8);
            URI uri = URI.create(properties.baseUrl() + "/search?format=jsonv2&limit=1&q=" + encodedQuery);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(uri)
                    .GET()
                    .timeout(Duration.ofMillis(properties.requestTimeoutMs()))
                    .header("Accept", "application/json")
                    .header("User-Agent", properties.userAgent())
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                logger.debug("Geocoding request failed for {} with status {}", query, response.statusCode());
                return fallback(region, country, regionCode);
            }

            List<NominatimResult> results = objectMapper.readValue(response.body(), new TypeReference<>() {
            });
            if (results.isEmpty()) {
                return fallback(region, country, regionCode);
            }

            NominatimResult match = results.get(0);
            double latitude = parseCoordinate(match.lat());
            double longitude = parseCoordinate(match.lon());
            GeoBounds bounds = parseBounds(match.boundingBox(), latitude, longitude, regionCode, region, country);
            LocationPrecision precision = inferPrecision(region, country, bounds, latitude, longitude);

            return new GeoLocation(
                    match.displayName() == null || match.displayName().isBlank() ? query : match.displayName(),
                    latitude,
                    longitude,
                    precision,
                    bounds
            );
        } catch (IOException exception) {
            logger.debug("Geocoding parse failed for {}: {}", query, exception.getMessage());
            return fallback(region, country, regionCode);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            logger.debug("Geocoding interrupted for {}", query);
            return fallback(region, country, regionCode);
        }
    }

    private GeoLocation fallback(String region, String country, String regionCode) {
        String label = buildQuery(region, country);
        return switch (regionCode == null ? "" : regionCode.toUpperCase(Locale.ROOT)) {
            case "US" -> fallbackGeoLocation(label, 39.8283, -98.5795, 13.5, 29.0);
            case "IN" -> fallbackGeoLocation(label, 20.5937, 78.9629, 14.0, 17.5);
            case "GB" -> fallbackGeoLocation(label, 55.3781, -3.4360, 4.2, 5.2);
            case "AU" -> fallbackGeoLocation(label, -25.2744, 133.7751, 17.0, 20.0);
            case "CA" -> fallbackGeoLocation(label, 56.1304, -106.3468, 17.5, 31.0);
            case "SG" -> fallbackGeoLocation(label, 1.3521, 103.8198, 0.18, 0.2);
            case "AE" -> fallbackGeoLocation(label, 23.4241, 53.8478, 2.0, 2.2);
            case "FR" -> fallbackGeoLocation(label, 46.2276, 2.2137, 5.3, 5.5);
            case "DE" -> fallbackGeoLocation(label, 51.1657, 10.4515, 5.7, 6.0);
            case "BR" -> fallbackGeoLocation(label, -14.2350, -51.9253, 19.0, 18.0);
            case "MX" -> fallbackGeoLocation(label, 23.6345, -102.5528, 9.5, 12.0);
            case "ZA" -> fallbackGeoLocation(label, -30.5595, 22.9375, 6.0, 7.2);
            case "JP" -> fallbackGeoLocation(label, 36.2048, 138.2529, 5.3, 7.5);
            default -> new GeoLocation(
                    label.isBlank() ? "Location unavailable" : label,
                    0,
                    0,
                    LocationPrecision.UNAVAILABLE,
                    GeoBounds.unavailable()
            );
        };
    }

    private String buildQuery(String region, String country) {
        String normalizedRegion = region == null ? "" : region.trim();
        String normalizedCountry = country == null ? "" : country.trim();

        if (!normalizedRegion.isBlank() && !normalizedCountry.isBlank()
                && !normalizedRegion.equalsIgnoreCase(normalizedCountry)) {
            return normalizedRegion + ", " + normalizedCountry;
        }
        if (!normalizedCountry.isBlank()) {
            return normalizedCountry;
        }
        return normalizedRegion;
    }

    private double parseCoordinate(String value) {
        if (value == null || value.isBlank()) {
            return 0;
        }
        try {
            return Double.parseDouble(value);
        } catch (NumberFormatException exception) {
            return 0;
        }
    }

    private GeoLocation fallbackGeoLocation(String label, double latitude, double longitude, double latitudeDelta, double longitudeDelta) {
        String normalizedLabel = label == null || label.isBlank() ? "Location unavailable" : label;
        return new GeoLocation(
                normalizedLabel,
                latitude,
                longitude,
                LocationPrecision.COUNTRY,
                GeoBounds.fromCenter(latitude, longitude, latitudeDelta, longitudeDelta)
        );
    }

    private GeoBounds parseBounds(
            List<String> boundingBox,
            double latitude,
            double longitude,
            String regionCode,
            String region,
            String country
    ) {
        if (boundingBox != null && boundingBox.size() >= 4) {
            double southLatitude = parseCoordinate(boundingBox.get(0));
            double northLatitude = parseCoordinate(boundingBox.get(1));
            double westLongitude = parseCoordinate(boundingBox.get(2));
            double eastLongitude = parseCoordinate(boundingBox.get(3));

            if (southLatitude != 0 || northLatitude != 0 || westLongitude != 0 || eastLongitude != 0) {
                return GeoBounds.of(southLatitude, northLatitude, westLongitude, eastLongitude);
            }
        }

        if (latitude == 0 && longitude == 0) {
            return fallback(region, country, regionCode).bounds();
        }

        boolean countryOnly = region == null || region.isBlank() || region.equalsIgnoreCase(country);
        if (countryOnly) {
            return GeoBounds.fromCenter(latitude, longitude, 6.0, 8.0);
        }
        return GeoBounds.fromCenter(latitude, longitude, 1.6, 1.8);
    }

    private LocationPrecision inferPrecision(
            String region,
            String country,
            GeoBounds bounds,
            double latitude,
            double longitude
    ) {
        if (latitude == 0 && longitude == 0) {
            return LocationPrecision.UNAVAILABLE;
        }

        boolean countryOnly = region == null || region.isBlank() || region.equalsIgnoreCase(country);
        double latitudeSpan = Math.abs(bounds.northLatitude() - bounds.southLatitude());
        double longitudeSpan = Math.abs(bounds.eastLongitude() - bounds.westLongitude());
        double dominantSpan = Math.max(latitudeSpan, longitudeSpan);

        if (countryOnly) {
            return dominantSpan >= 1.0 ? LocationPrecision.COUNTRY : LocationPrecision.REGION;
        }

        if (dominantSpan >= 4.0) {
            return LocationPrecision.REGION;
        }
        return LocationPrecision.AREA;
    }

    public record GeoLocation(
            String label,
            double latitude,
            double longitude,
            LocationPrecision precision,
            GeoBounds bounds
    ) {
    }

    public record GeoBounds(
            double southLatitude,
            double northLatitude,
            double westLongitude,
            double eastLongitude
    ) {
        public static GeoBounds of(double southLatitude, double northLatitude, double westLongitude, double eastLongitude) {
            double normalizedSouth = Math.min(southLatitude, northLatitude);
            double normalizedNorth = Math.max(southLatitude, northLatitude);
            double normalizedWest = Math.min(westLongitude, eastLongitude);
            double normalizedEast = Math.max(westLongitude, eastLongitude);
            return new GeoBounds(normalizedSouth, normalizedNorth, normalizedWest, normalizedEast);
        }

        public static GeoBounds fromCenter(double latitude, double longitude, double latitudeDelta, double longitudeDelta) {
            return of(
                    latitude - latitudeDelta,
                    latitude + latitudeDelta,
                    longitude - longitudeDelta,
                    longitude + longitudeDelta
            );
        }

        public static GeoBounds unavailable() {
            return new GeoBounds(0, 0, 0, 0);
        }
    }

    private record NominatimResult(
            String lat,
            String lon,
            @JsonProperty("display_name")
            String displayName,
            @JsonProperty("boundingbox")
            List<String> boundingBox
    ) {
    }
}
