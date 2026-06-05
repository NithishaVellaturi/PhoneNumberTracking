package com.tracksecure.backend.service;

import com.tracksecure.backend.domain.AnalyticsSnapshot;
import com.tracksecure.backend.domain.PhoneSearch;
import com.tracksecure.backend.repository.AnalyticsSnapshotRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneOffset;

@Service
public class AnalyticsService {

    private final AnalyticsSnapshotRepository analyticsSnapshotRepository;

    public AnalyticsService(AnalyticsSnapshotRepository analyticsSnapshotRepository) {
        this.analyticsSnapshotRepository = analyticsSnapshotRepository;
    }

    @Transactional
    public void recordLookup(PhoneSearch search) {
        LocalDate date = search.getSearchedAt().atZone(ZoneOffset.UTC).toLocalDate();
        AnalyticsSnapshot snapshot = analyticsSnapshotRepository.findByDate(date)
                .orElseGet(() -> {
                    AnalyticsSnapshot analyticsSnapshot = new AnalyticsSnapshot();
                    analyticsSnapshot.setDate(date);
                    analyticsSnapshot.setTotalSearches(0);
                    analyticsSnapshot.setSpamReports(0);
                    return analyticsSnapshot;
                });

        snapshot.setTotalSearches(snapshot.getTotalSearches() + 1);
        if (search.getSpamScore() >= 70) {
            snapshot.setSpamReports(snapshot.getSpamReports() + 1);
        }

        analyticsSnapshotRepository.save(snapshot);
    }
}
