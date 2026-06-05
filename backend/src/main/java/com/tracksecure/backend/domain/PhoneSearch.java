package com.tracksecure.backend.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
        name = "phone_searches",
        indexes = {
                @Index(name = "idx_phone_searches_phone_number", columnList = "phone_number"),
                @Index(name = "idx_phone_searches_searched_at", columnList = "searched_at"),
                @Index(name = "idx_phone_searches_country", columnList = "country"),
                @Index(name = "idx_phone_searches_carrier", columnList = "carrier")
        }
)
public class PhoneSearch {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "phone_number", nullable = false, length = 32)
    private String phoneNumber;

    @Column(nullable = false, length = 120)
    private String country;

    @Column(name = "country_flag", nullable = false, length = 8)
    private String countryFlag;

    @Column(name = "country_code", nullable = false, length = 16)
    private String countryCode;

    @Column(nullable = false, length = 180)
    private String region;

    @Column(nullable = false, length = 160)
    private String carrier;

    @Column(name = "line_type", nullable = false, length = 80)
    private String lineType;

    @Column(nullable = false, length = 160)
    private String timezone;

    @Column(name = "estimated_location", nullable = false, length = 220)
    private String estimatedLocation;

    @Column(name = "estimated_latitude", nullable = false)
    private double estimatedLatitude;

    @Column(name = "estimated_longitude", nullable = false)
    private double estimatedLongitude;

    @Column(name = "spam_score", nullable = false)
    private int spamScore;

    @Enumerated(EnumType.STRING)
    @Column(name = "risk_level", nullable = false, length = 12)
    private RiskLevel riskLevel;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 12)
    private LookupStatus status;

    @Column(name = "is_valid_number", nullable = false)
    private boolean validNumber;

    @Column(name = "searched_at", nullable = false)
    private Instant searchedAt;

    public UUID getId() {
        return id;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getCountryFlag() {
        return countryFlag;
    }

    public void setCountryFlag(String countryFlag) {
        this.countryFlag = countryFlag;
    }

    public String getCountryCode() {
        return countryCode;
    }

    public void setCountryCode(String countryCode) {
        this.countryCode = countryCode;
    }

    public String getRegion() {
        return region;
    }

    public void setRegion(String region) {
        this.region = region;
    }

    public String getCarrier() {
        return carrier;
    }

    public void setCarrier(String carrier) {
        this.carrier = carrier;
    }

    public String getLineType() {
        return lineType;
    }

    public void setLineType(String lineType) {
        this.lineType = lineType;
    }

    public String getTimezone() {
        return timezone;
    }

    public void setTimezone(String timezone) {
        this.timezone = timezone;
    }

    public String getEstimatedLocation() {
        return estimatedLocation;
    }

    public void setEstimatedLocation(String estimatedLocation) {
        this.estimatedLocation = estimatedLocation;
    }

    public double getEstimatedLatitude() {
        return estimatedLatitude;
    }

    public void setEstimatedLatitude(double estimatedLatitude) {
        this.estimatedLatitude = estimatedLatitude;
    }

    public double getEstimatedLongitude() {
        return estimatedLongitude;
    }

    public void setEstimatedLongitude(double estimatedLongitude) {
        this.estimatedLongitude = estimatedLongitude;
    }

    public int getSpamScore() {
        return spamScore;
    }

    public void setSpamScore(int spamScore) {
        this.spamScore = spamScore;
    }

    public RiskLevel getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(RiskLevel riskLevel) {
        this.riskLevel = riskLevel;
    }

    public LookupStatus getStatus() {
        return status;
    }

    public void setStatus(LookupStatus status) {
        this.status = status;
    }

    public boolean isValidNumber() {
        return validNumber;
    }

    public void setValidNumber(boolean validNumber) {
        this.validNumber = validNumber;
    }

    public Instant getSearchedAt() {
        return searchedAt;
    }

    public void setSearchedAt(Instant searchedAt) {
        this.searchedAt = searchedAt;
    }
}
