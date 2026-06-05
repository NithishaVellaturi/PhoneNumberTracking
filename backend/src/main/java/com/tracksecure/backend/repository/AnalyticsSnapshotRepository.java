package com.tracksecure.backend.repository;

import com.tracksecure.backend.domain.AnalyticsSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AnalyticsSnapshotRepository extends JpaRepository<AnalyticsSnapshot, UUID> {

    Optional<AnalyticsSnapshot> findByDate(LocalDate date);

    List<AnalyticsSnapshot> findByDateBetweenOrderByDateAsc(LocalDate startDate, LocalDate endDate);

    @Query("select coalesce(sum(a.spamReports), 0) from AnalyticsSnapshot a")
    long sumSpamReports();
}
