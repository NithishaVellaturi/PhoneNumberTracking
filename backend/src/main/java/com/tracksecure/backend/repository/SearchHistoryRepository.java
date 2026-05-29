package com.tracksecure.backend.repository;

import com.tracksecure.backend.domain.SearchHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface SearchHistoryRepository extends JpaRepository<SearchHistory, UUID> {

    List<SearchHistory> findTop50ByUserIdOrderByLastCheckedDesc(UUID userId);

    List<SearchHistory> findTop20ByOrderByLastCheckedDesc();

    List<SearchHistory> findByLastCheckedAfter(Instant since);
}
