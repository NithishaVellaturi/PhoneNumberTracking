package com.tracksecure.backend.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
        name = "search_history",
        indexes = {
                @Index(name = "idx_search_history_user_time", columnList = "user_id,last_checked"),
                @Index(name = "idx_search_history_phone", columnList = "phone_number")
        }
)
public class SearchHistory {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private UserAccount user;

    @Column(name = "phone_number", nullable = false, length = 32)
    private String phoneNumber;

    @Column(name = "country_code", nullable = false, length = 8)
    private String countryCode;

    @Column(name = "operator_name", nullable = false, length = 120)
    private String operatorName;

    @Column(name = "business_caller_name", length = 160)
    private String businessCallerName;

    @Column(nullable = false, length = 180)
    private String region;

    @Column(name = "line_type", nullable = false, length = 80)
    private String lineType;

    @Column(name = "spam_score", nullable = false)
    private int spamScore;

    @Column(name = "report_count", nullable = false)
    private long reportCount;

    @Enumerated(EnumType.STRING)
    @Column(name = "risk_level", nullable = false, length = 12)
    private RiskLevel riskLevel;

    @Column(name = "last_checked", nullable = false)
    private Instant lastChecked;

    public UUID getId() {
        return id;
    }

    public UserAccount getUser() {
        return user;
    }

    public void setUser(UserAccount user) {
        this.user = user;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getCountryCode() {
        return countryCode;
    }

    public void setCountryCode(String countryCode) {
        this.countryCode = countryCode;
    }

    public String getOperatorName() {
        return operatorName;
    }

    public void setOperatorName(String operatorName) {
        this.operatorName = operatorName;
    }

    public String getBusinessCallerName() {
        return businessCallerName;
    }

    public void setBusinessCallerName(String businessCallerName) {
        this.businessCallerName = businessCallerName;
    }

    public String getRegion() {
        return region;
    }

    public void setRegion(String region) {
        this.region = region;
    }

    public String getLineType() {
        return lineType;
    }

    public void setLineType(String lineType) {
        this.lineType = lineType;
    }

    public int getSpamScore() {
        return spamScore;
    }

    public void setSpamScore(int spamScore) {
        this.spamScore = spamScore;
    }

    public long getReportCount() {
        return reportCount;
    }

    public void setReportCount(long reportCount) {
        this.reportCount = reportCount;
    }

    public RiskLevel getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(RiskLevel riskLevel) {
        this.riskLevel = riskLevel;
    }

    public Instant getLastChecked() {
        return lastChecked;
    }

    public void setLastChecked(Instant lastChecked) {
        this.lastChecked = lastChecked;
    }
}
