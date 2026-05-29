package com.tracksecure.backend.service;

import com.google.i18n.phonenumbers.NumberParseException;
import com.google.i18n.phonenumbers.PhoneNumberToCarrierMapper;
import com.google.i18n.phonenumbers.PhoneNumberUtil;
import com.google.i18n.phonenumbers.Phonenumber.PhoneNumber;
import com.google.i18n.phonenumbers.geocoding.PhoneNumberOfflineGeocoder;
import com.tracksecure.backend.domain.RiskLevel;
import com.tracksecure.backend.exception.ApiException;
import com.tracksecure.backend.util.InputSanitizer;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Locale;

@Service
public class PhoneNumberLookupService {

    private final PhoneNumberUtil phoneNumberUtil = PhoneNumberUtil.getInstance();
    private final PhoneNumberToCarrierMapper carrierMapper = PhoneNumberToCarrierMapper.getInstance();
    private final PhoneNumberOfflineGeocoder geocoder = PhoneNumberOfflineGeocoder.getInstance();
    private final InputSanitizer inputSanitizer;

    public PhoneNumberLookupService(InputSanitizer inputSanitizer) {
        this.inputSanitizer = inputSanitizer;
    }

    public PhoneLookupResult lookup(String rawPhoneNumber, String rawCountryCode, long reportCount) {
        String phoneNumber = inputSanitizer.normalizePhone(rawPhoneNumber);
        String countryCode = inputSanitizer.normalizeCountryCode(rawCountryCode);
        PhoneNumber parsedNumber = parse(phoneNumber, countryCode);
        return buildResult(parsedNumber, reportCount, false, null, null);
    }

    public PhoneLookupResult lookupNormalized(String normalizedPhoneNumber, long reportCount) {
        return buildResult(parse(normalizedPhoneNumber, null), reportCount, false, null, null);
    }

    public PhoneLookupResult withBusinessCallerName(PhoneLookupResult lookupResult, String businessCallerName) {
        return new PhoneLookupResult(
                lookupResult.phoneNumber(),
                lookupResult.countryCode(),
                lookupResult.countryName(),
                lookupResult.savedNumber(),
                lookupResult.savedCallerName(),
                businessCallerName,
                lookupResult.operator(),
                lookupResult.region(),
                lookupResult.lineType(),
                lookupResult.spamScore(),
                lookupResult.reportCount(),
                lookupResult.riskLevel(),
                lookupResult.lastChecked()
        );
    }

    public PhoneLookupResult withSavedCallerData(
            PhoneLookupResult lookupResult,
            boolean savedNumber,
            String savedCallerName
    ) {
        return new PhoneLookupResult(
                lookupResult.phoneNumber(),
                lookupResult.countryCode(),
                lookupResult.countryName(),
                savedNumber,
                savedCallerName,
                lookupResult.businessCallerName(),
                lookupResult.operator(),
                lookupResult.region(),
                lookupResult.lineType(),
                lookupResult.spamScore(),
                lookupResult.reportCount(),
                lookupResult.riskLevel(),
                lookupResult.lastChecked()
        );
    }

    public String resolveCountryName(String normalizedPhoneNumber) {
        PhoneNumber parsedNumber = parse(normalizedPhoneNumber, null);
        String countryName = displayCountry(phoneNumberUtil.getRegionCodeForNumber(parsedNumber));
        if (countryName == null || countryName.isBlank()) {
            return "Unknown country";
        }
        return countryName;
    }

    private PhoneLookupResult buildResult(
            PhoneNumber phoneNumber,
            long reportCount,
            boolean savedNumber,
            String savedCallerName,
            String businessCallerName
    ) {
        if (!phoneNumberUtil.isValidNumber(phoneNumber)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "invalid_phone_number", "Enter a valid phone number.");
        }

        String normalizedNumber = phoneNumberUtil.format(phoneNumber, PhoneNumberUtil.PhoneNumberFormat.E164);
        String regionCode = phoneNumberUtil.getRegionCodeForNumber(phoneNumber);
        String countryCode = "+" + phoneNumber.getCountryCode();
        String countryName = displayCountry(regionCode);
        String operator = carrierMapper.getNameForValidNumber(phoneNumber, Locale.ENGLISH);
        String region = geocoder.getDescriptionForValidNumber(phoneNumber, Locale.ENGLISH);
        String lineType = describeLineType(phoneNumberUtil.getNumberType(phoneNumber));

        if (countryName == null || countryName.isBlank()) {
            countryName = "Unknown country";
        }
        if (operator == null || operator.isBlank()) {
            operator = "Carrier unavailable";
        }
        if (region == null || region.isBlank()) {
            region = displayCountry(regionCode);
        }
        if (region == null || region.isBlank()) {
            region = "Unknown region";
        }

        int spamScore = calculateSpamScore(reportCount, phoneNumberUtil.getNumberType(phoneNumber), normalizedNumber);
        return new PhoneLookupResult(
                normalizedNumber,
                countryCode,
                countryName,
                savedNumber,
                savedCallerName,
                businessCallerName,
                operator,
                region,
                lineType,
                spamScore,
                reportCount,
                toRiskLevel(spamScore),
                Instant.now()
        );
    }

    private PhoneNumber parse(String phoneNumber, String countryCode) {
        if (phoneNumber == null || phoneNumber.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "invalid_phone_number", "Phone number is required.");
        }

        try {
            if (phoneNumber.startsWith("+")) {
                return phoneNumberUtil.parse(phoneNumber, null);
            }
            return phoneNumberUtil.parse(phoneNumber, countryCode);
        } catch (NumberParseException exception) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "invalid_phone_number", "Enter a valid phone number.");
        }
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
            default -> "Unknown";
        };
    }

    private int calculateSpamScore(
            long reportCount,
            PhoneNumberUtil.PhoneNumberType numberType,
            String normalizedNumber
    ) {
        int score = (int) Math.min(70, reportCount * 22);
        score += switch (numberType) {
            case VOIP -> 18;
            case PREMIUM_RATE -> 24;
            case SHARED_COST -> 14;
            case TOLL_FREE -> 8;
            case PERSONAL_NUMBER -> 12;
            case UAN -> 10;
            case FIXED_LINE_OR_MOBILE -> 8;
            case MOBILE -> 6;
            case FIXED_LINE -> 4;
            default -> 2;
        };

        if (normalizedNumber.matches(".*(0000|1111|1234|9999)$")) {
            score += 8;
        }
        if (reportCount == 0) {
            score = Math.max(score, 12);
        }

        return Math.min(score, 98);
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
}
