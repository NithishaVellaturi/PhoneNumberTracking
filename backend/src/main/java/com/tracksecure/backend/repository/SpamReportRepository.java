package com.tracksecure.backend.repository;

import com.tracksecure.backend.domain.SpamReport;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface SpamReportRepository extends JpaRepository<SpamReport, UUID> {

    long countByPhoneNumber(String phoneNumber);

    List<SpamReport> findTop50ByOrderByCreatedAtDesc();

    List<SpamReport> findByCreatedAtAfter(Instant since);
}
