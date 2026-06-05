package com.tracksecure.backend.service;

import com.google.i18n.phonenumbers.NumberParseException;
import com.google.i18n.phonenumbers.PhoneNumberToCarrierMapper;
import com.google.i18n.phonenumbers.PhoneNumberToTimeZonesMapper;
import com.google.i18n.phonenumbers.PhoneNumberUtil;
import com.google.i18n.phonenumbers.Phonenumber.PhoneNumber;
import com.google.i18n.phonenumbers.geocoding.PhoneNumberOfflineGeocoder;
import com.tracksecure.backend.domain.LocationPrecision;
import com.tracksecure.backend.domain.LookupStatus;
import com.tracksecure.backend.domain.PhoneSearch;
import com.tracksecure.backend.domain.RiskLevel;
import com.tracksecure.backend.dto.phone.LookupHistoryItem;
import com.tracksecure.backend.dto.phone.MapBoundsResponse;
import com.tracksecure.backend.dto.phone.PhoneLookupResponse;
import com.tracksecure.backend.exception.ApiException;
import com.tracksecure.backend.repository.PhoneSearchRepository;
import com.tracksecure.backend.util.InputSanitizer;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Locale;

@Service
public class PhoneNumberLookupService {

    private final PhoneNumberUtil phoneNumberUtil = PhoneNumberUtil.getInstance();
    private final PhoneNumberToCarrierMapper carrierMapper = PhoneNumberToCarrierMapper.getInstance();
    private final PhoneNumberOfflineGeocoder geocoder = PhoneNumberOfflineGeocoder.getInstance();
    private final PhoneNumberToTimeZonesMapper timeZonesMapper = PhoneNumberToTimeZonesMapper.getInstance();

    private final InputSanitizer inputSanitizer;
    private final PhoneSearchRepository phoneSearchRepository;
    private final PublicBusinessCallerNameService publicBusinessCallerNameService;
    private final GeoCodingService geoCodingService;
    private final AnalyticsService analyticsService;

    public PhoneNumberLookupService(
            InputSanitizer inputSanitizer,
            PhoneSearchRepository phoneSearchRepository,
            PublicBusinessCallerNameService publicBusinessCallerNameService,
            GeoCodingService geoCodingService,
            AnalyticsService analyticsService
    ) {
        this.inputSanitizer = inputSanitizer;
        this.phoneSearchRepository = phoneSearchRepository;
        this.publicBusinessCallerNameService = publicBusinessCallerNameService;
        this.geoCodingService = geoCodingService;
        this.analyticsService = analyticsService;
    }

    @Transactional
    public PhoneLookupResponse lookup(String rawPhoneNumber, String rawCountryCode) {
        String phoneNumber = inputSanitizer.normalizePhone(rawPhoneNumber);
        if (phoneNumber.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "invalid_phone_number", "Phone number is required.");
        }

        String countryCode = inputSanitizer.normalizeCountryCode(rawCountryCode);
        PhoneLookupResult result = buildLookup(phoneNumber, countryCode);
        PhoneSearch search = saveLookup(result);
        analyticsService.recordLookup(search);

        List<LookupHistoryItem> history = phoneSearchRepository.findTop6ByPhoneNumberOrderBySearchedAtDesc(search.getPhoneNumber())
                .stream()
                .map(this::toHistoryItem)
                .toList();

        return new PhoneLookupResponse(
                search.getPhoneNumber(),
                search.getCountry(),
                search.getCountryFlag(),
                search.getCountryCode(),
                search.getRegion(),
                search.getCarrier(),
                search.getLineType(),
                search.getTimezone(),
                search.getEstimatedLocation(),
                search.getSpamScore(),
                search.getRiskLevel(),
                search.getStatus(),
                search.isValidNumber(),
                search.getEstimatedLatitude(),
                search.getEstimatedLongitude(),
                result.locationPrecision(),
                toMapBoundsResponse(result.mapBounds()),
                search.getSearchedAt(),
                history
        );
    }

    private PhoneLookupResult buildLookup(String rawPhoneNumber, String countryCode) {
        Instant now = Instant.now();
        try {
            PhoneNumber parsedNumber = parse(rawPhoneNumber, countryCode);
            boolean isPossible = phoneNumberUtil.isPossibleNumber(parsedNumber);
            boolean isValid = phoneNumberUtil.isValidNumber(parsedNumber);
            LookupStatus status = isValid ? LookupStatus.VALID : (isPossible ? LookupStatus.UNKNOWN : LookupStatus.INVALID);

            String normalizedNumber = phoneNumberUtil.format(parsedNumber, PhoneNumberUtil.PhoneNumberFormat.E164);
            String regionCode = resolveRegionCode(parsedNumber, countryCode);
            String country = fallback(displayCountry(regionCode), "Unknown country");
            String countryFlag = toFlagEmoji(regionCode);
            String dialCode = "+" + parsedNumber.getCountryCode();
            String carrier = isValid
                    ? fallback(carrierMapper.getNameForValidNumber(parsedNumber, Locale.ENGLISH), "Carrier unavailable")
                    : "Carrier unavailable";
            String region = isValid
                    ? fallback(geocoder.getDescriptionForValidNumber(parsedNumber, Locale.ENGLISH), country)
                    : country;
            String lineType = describeLineType(phoneNumberUtil.getNumberType(parsedNumber));
            String timezone = formatTimezones(timeZonesMapper.getTimeZonesForNumber(parsedNumber));
            String businessCallerName = publicBusinessCallerNameService.lookupBusinessCallerName(normalizedNumber, country)
                    .businessCallerName();
            GeoCodingService.GeoLocation geoLocation = geoCodingService.resolve(region, country, regionCode);
            long priorLookupCount = phoneSearchRepository.countByPhoneNumber(normalizedNumber);
            int spamScore = calculateSpamScore(
                    status,
                    phoneNumberUtil.getNumberType(parsedNumber),
                    normalizedNumber,
                    carrier,
                    businessCallerName,
                    priorLookupCount
            );

            return new PhoneLookupResult(
                    normalizedNumber,
                    country,
                    countryFlag,
                    dialCode,
                    fallback(region, "Unknown region"),
                    regionCode,
                    carrier,
                    lineType,
                    timezone,
                    geoLocation.label(),
                    geoLocation.latitude(),
                    geoLocation.longitude(),
                    geoLocation.precision(),
                    geoLocation.bounds(),
                    spamScore,
                    toRiskLevel(spamScore),
                    status,
                    isValid,
                    now
            );
        } catch (NumberParseException exception) {
            return invalidLookup(rawPhoneNumber, now);
        }
    }

    private PhoneLookupResult invalidLookup(String rawPhoneNumber, Instant now) {
        String normalized = rawPhoneNumber.startsWith("+") ? rawPhoneNumber : rawPhoneNumber.replaceAll("\\s+", "");
        return new PhoneLookupResult(
                normalized,
                "Unknown country",
                "🌐",
                "Unknown",
                "Unknown region",
                "",
                "Carrier unavailable",
                "Unknown",
                "Timezone unavailable",
                "Location unavailable",
                0,
                0,
                LocationPrecision.UNAVAILABLE,
                GeoCodingService.GeoBounds.unavailable(),
                0,
                RiskLevel.LOW,
                LookupStatus.INVALID,
                false,
                now
        );
    }

    private PhoneNumber parse(String phoneNumber, String countryCode) throws NumberParseException {
        if (phoneNumber.startsWith("+")) {
            return phoneNumberUtil.parse(phoneNumber, null);
        }
        return phoneNumberUtil.parse(phoneNumber, countryCode);
    }

    private PhoneSearch saveLookup(PhoneLookupResult result) {
        PhoneSearch search = new PhoneSearch();
        search.setPhoneNumber(result.phoneNumber());
        search.setCountry(result.country());
        search.setCountryFlag(result.countryFlag());
        search.setCountryCode(result.countryCode());
        search.setRegion(result.region());
        search.setCarrier(result.carrier());
        search.setLineType(result.lineType());
        search.setTimezone(result.timezone());
        search.setEstimatedLocation(result.estimatedLocation());
        search.setEstimatedLatitude(result.estimatedLatitude());
        search.setEstimatedLongitude(result.estimatedLongitude());
        search.setSpamScore(result.spamScore());
        search.setRiskLevel(result.riskLevel());
        search.setStatus(result.status());
        search.setValidNumber(result.valid());
        search.setSearchedAt(result.lastLookupDate());
        return phoneSearchRepository.save(search);
    }

    private LookupHistoryItem toHistoryItem(PhoneSearch search) {
        return new LookupHistoryItem(
                search.getPhoneNumber(),
                search.getCountry(),
                search.getRegion(),
                search.getCarrier(),
                search.getLineType(),
                search.getSpamScore(),
                search.getRiskLevel(),
                search.getStatus(),
                search.getSearchedAt()
        );
    }

    private MapBoundsResponse toMapBoundsResponse(GeoCodingService.GeoBounds bounds) {
        return new MapBoundsResponse(
                bounds.southLatitude(),
                bounds.northLatitude(),
                bounds.westLongitude(),
                bounds.eastLongitude()
        );
    }

    private String resolveRegionCode(PhoneNumber phoneNumber, String fallbackRegion) {
        String regionCode = phoneNumberUtil.getRegionCodeForNumber(phoneNumber);
        if (regionCode == null || regionCode.isBlank()) {
            return fallbackRegion;
        }
        return regionCode;
    }

    private String describeLineType(PhoneNumberUtil.PhoneNumberType type) {
        return switch (type) {
            case MOBILE -> "Mobile";
            case FIXED_LINE -> "Fixed line";
            case FIXED_LINE_OR_MOBILE -> "Fixed line / mobile";
            case TOLL_FREE -> "Toll-free";
            case PREMIUM_RATE -> "Premium rate";
            case SHARED_COST -> "Shared cost";
            case VOIP -> "VoIP";
            case PERSONAL_NUMBER -> "Personal number";
            case PAGER -> "Pager";
            case UAN -> "UAN";
            case VOICEMAIL -> "Voicemail";
            case UNKNOWN -> "Unknown";
        };
    }

    private String formatTimezones(List<String> timezones) {
        List<String> filtered = timezones.stream()
                .filter(timezone -> timezone != null && !timezone.isBlank() && !"Etc/Unknown".equalsIgnoreCase(timezone))
                .distinct()
                .toList();
        if (filtered.isEmpty()) {
            return "Timezone unavailable";
        }
        return String.join(", ", filtered);
    }

    private int calculateSpamScore(
            LookupStatus status,
            PhoneNumberUtil.PhoneNumberType numberType,
            String normalizedNumber,
            String carrier,
            String businessCallerName,
            long priorLookupCount
    ) {
        if (status == LookupStatus.INVALID) {
            return 0;
        }

        int score = switch (numberType) {
            case PREMIUM_RATE -> 72;
            case VOIP -> 61;
            case PERSONAL_NUMBER -> 55;
            case SHARED_COST -> 48;
            case TOLL_FREE -> 36;
            case FIXED_LINE_OR_MOBILE -> 30;
            case MOBILE -> 24;
            case FIXED_LINE -> 18;
            case UAN -> 32;
            case PAGER, VOICEMAIL -> 20;
            case UNKNOWN -> 28;
        };

        if (status == LookupStatus.UNKNOWN) {
            score += 10;
        }
        if ("Carrier unavailable".equalsIgnoreCase(carrier)) {
            score += 8;
        }
        if (businessCallerName != null && !businessCallerName.isBlank()) {
            score -= 12;
        }
        if (priorLookupCount >= 5) {
            score += 10;
        } else if (priorLookupCount >= 2) {
            score += 5;
        }
        if (normalizedNumber.matches(".*(0000|1111|1234|9999)$")) {
            score += 7;
        }

        return Math.max(0, Math.min(score, 98));
    }

    private RiskLevel toRiskLevel(int spamScore) {
        if (spamScore >= 70) {
            return RiskLevel.HIGH;
        }
        if (spamScore >= 35) {
            return RiskLevel.MEDIUM;
        }
        return RiskLevel.LOW;
    }

    private String displayCountry(String regionCode) {
        if (regionCode == null || regionCode.isBlank()) {
            return null;
        }
        return new Locale("", regionCode).getDisplayCountry(Locale.ENGLISH);
    }

    private String toFlagEmoji(String regionCode) {
        if (regionCode == null || regionCode.length() != 2) {
            return "🌐";
        }

        String uppercase = regionCode.toUpperCase(Locale.ROOT);
        int first = Character.codePointAt(uppercase, 0) - 'A' + 0x1F1E6;
        int second = Character.codePointAt(uppercase, 1) - 'A' + 0x1F1E6;
        return new String(Character.toChars(first)) + new String(Character.toChars(second));
    }

    private String fallback(String value, String fallback) {
        if (value == null || value.isBlank()) {
            return fallback;
        }
        return value;
    }
}
