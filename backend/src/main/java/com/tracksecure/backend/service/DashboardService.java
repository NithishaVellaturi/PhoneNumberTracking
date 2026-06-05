package com.tracksecure.backend.service;

import com.tracksecure.backend.domain.LookupStatus;
import com.tracksecure.backend.domain.PhoneSearch;
import com.tracksecure.backend.dto.dashboard.DailyAnalyticsPoint;
import com.tracksecure.backend.dto.dashboard.DashboardStatsResponse;
import com.tracksecure.backend.dto.dashboard.DashboardTrendsResponse;
import com.tracksecure.backend.dto.dashboard.NamedMetric;
import com.tracksecure.backend.dto.phone.LookupHistoryItem;
import com.tracksecure.backend.repository.AnalyticsSnapshotRepository;
import com.tracksecure.backend.repository.MetricProjection;
import com.tracksecure.backend.repository.PhoneSearchRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private static final DateTimeFormatter DATE_LABEL_FORMATTER = DateTimeFormatter.ofPattern("MMM d");

    private final PhoneSearchRepository phoneSearchRepository;
    private final AnalyticsSnapshotRepository analyticsSnapshotRepository;

    public DashboardService(
            PhoneSearchRepository phoneSearchRepository,
            AnalyticsSnapshotRepository analyticsSnapshotRepository
    ) {
        this.phoneSearchRepository = phoneSearchRepository;
        this.analyticsSnapshotRepository = analyticsSnapshotRepository;
    }

    public DashboardStatsResponse getDashboardStats() {
        Instant startOfToday = LocalDate.now(ZoneOffset.UTC).atStartOfDay().toInstant(ZoneOffset.UTC);

        return new DashboardStatsResponse(
                phoneSearchRepository.count(),
                phoneSearchRepository.countBySearchedAtAfter(startOfToday),
                analyticsSnapshotRepository.sumSpamReports(),
                phoneSearchRepository.countByStatus(LookupStatus.VALID),
                phoneSearchRepository.countByStatus(LookupStatus.INVALID),
                phoneSearchRepository.averageSpamScore(),
                mapMetrics(phoneSearchRepository.findTopCountries(PageRequest.of(0, 5))),
                mapMetrics(phoneSearchRepository.findTopCarriers(PageRequest.of(0, 5)))
        );
    }

    public DashboardTrendsResponse getDashboardTrends() {
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        LocalDate startDate = today.minusDays(13);

        Map<LocalDate, com.tracksecure.backend.domain.AnalyticsSnapshot> snapshotsByDate =
                analyticsSnapshotRepository.findByDateBetweenOrderByDateAsc(startDate, today)
                        .stream()
                        .collect(Collectors.toMap(
                                com.tracksecure.backend.domain.AnalyticsSnapshot::getDate,
                                Function.identity()
                        ));

        List<DailyAnalyticsPoint> trend = new ArrayList<>();
        for (int index = 0; index < 14; index++) {
            LocalDate date = startDate.plusDays(index);
            com.tracksecure.backend.domain.AnalyticsSnapshot snapshot = snapshotsByDate.get(date);
            trend.add(new DailyAnalyticsPoint(
                    date.format(DATE_LABEL_FORMATTER),
                    snapshot == null ? 0L : snapshot.getTotalSearches(),
                    snapshot == null ? 0L : snapshot.getSpamReports()
            ));
        }

        return new DashboardTrendsResponse(
                trend,
                mapMetrics(phoneSearchRepository.findTopCountries(PageRequest.of(0, 6))),
                mapMetrics(phoneSearchRepository.findTopCarriers(PageRequest.of(0, 6))),
                mapMetrics(phoneSearchRepository.findRiskDistribution(PageRequest.of(0, 4))),
                mapMetrics(phoneSearchRepository.findLineTypeDistribution(PageRequest.of(0, 6))),
                phoneSearchRepository.findTop8ByOrderBySearchedAtDesc().stream()
                        .map(this::toHistoryItem)
                        .toList()
        );
    }

    private List<NamedMetric> mapMetrics(List<MetricProjection> metrics) {
        return metrics.stream()
                .map(metric -> new NamedMetric(metric.getLabel(), metric.getValue()))
                .toList();
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
}
