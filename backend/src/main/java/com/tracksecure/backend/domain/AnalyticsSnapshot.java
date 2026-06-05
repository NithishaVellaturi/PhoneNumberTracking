package com.tracksecure.backend.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(
        name = "analytics",
        uniqueConstraints = @UniqueConstraint(name = "uk_analytics_date", columnNames = "analytics_date")
)
public class AnalyticsSnapshot {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "analytics_date", nullable = false)
    private LocalDate date;

    @Column(name = "total_searches", nullable = false)
    private long totalSearches;

    @Column(name = "spam_reports", nullable = false)
    private long spamReports;

    public UUID getId() {
        return id;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public long getTotalSearches() {
        return totalSearches;
    }

    public void setTotalSearches(long totalSearches) {
        this.totalSearches = totalSearches;
    }

    public long getSpamReports() {
        return spamReports;
    }

    public void setSpamReports(long spamReports) {
        this.spamReports = spamReports;
    }
}
