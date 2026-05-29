package com.tracksecure.backend.service;

import com.tracksecure.backend.domain.SearchHistory;
import com.tracksecure.backend.domain.SpamReport;
import com.tracksecure.backend.dto.dashboard.DailyAnalyticsPoint;
import com.tracksecure.backend.dto.dashboard.DashboardStatsResponse;
import com.tracksecure.backend.dto.dashboard.RecentActivity;
import com.tracksecure.backend.dto.dashboard.RegionStatistic;
import com.tracksecure.backend.dto.dashboard.SpamReportSummary;
import com.tracksecure.backend.repository.SearchHistoryRepository;
import com.tracksecure.backend.repository.SpamReportRepository;
import com.tracksecure.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardService {

    private static final DateTimeFormatter DAY_FORMATTER = DateTimeFormatter.ofPattern("EEE");

    private final SearchHistoryRepository searchHistoryRepository;
    private final SpamReportRepository spamReportRepository;
    private final UserRepository userRepository;
    private final PhoneNumberLookupService phoneNumberLookupService;

    public DashboardService(
            SearchHistoryRepository searchHistoryRepository,
            SpamReportRepository spamReportRepository,
            UserRepository userRepository,
            PhoneNumberLookupService phoneNumberLookupService
    ) {
        this.searchHistoryRepository = searchHistoryRepository;
        this.spamReportRepository = spamReportRepository;
        this.userRepository = userRepository;
        this.phoneNumberLookupService = phoneNumberLookupService;
    }

    public DashboardStatsResponse getDashboardStats() {
        Instant now = Instant.now();
        Instant analyticsStart = now.minusSeconds(7L * 24 * 60 * 60);
        Instant regionsStart = now.minusSeconds(30L * 24 * 60 * 60);

        List<SearchHistory> recentSearches = searchHistoryRepository.findByLastCheckedAfter(analyticsStart);
        List<SpamReport> recentSpamReports = spamReportRepository.findByCreatedAtAfter(analyticsStart);

        return new DashboardStatsResponse(
                searchHistoryRepository.count(),
                spamReportRepository.count(),
                userRepository.countActiveSince(now.minusSeconds(30L * 24 * 60 * 60)),
                buildAnalytics(recentSearches, recentSpamReports),
                buildRegionStatistics(searchHistoryRepository.findByLastCheckedAfter(regionsStart)),
                buildRecentActivity(searchHistoryRepository.findTop20ByOrderByLastCheckedDesc(), spamReportRepository.findTop50ByOrderByCreatedAtDesc()),
                buildRecentReports(spamReportRepository.findTop50ByOrderByCreatedAtDesc())
        );
    }

    private List<DailyAnalyticsPoint> buildAnalytics(List<SearchHistory> searches, List<SpamReport> reports) {
        Map<LocalDate, Long> searchCounts = new LinkedHashMap<>();
        Map<LocalDate, Long> reportCounts = new LinkedHashMap<>();

        for (SearchHistory search : searches) {
            LocalDate date = LocalDate.ofInstant(search.getLastChecked(), ZoneOffset.UTC);
            searchCounts.merge(date, 1L, Long::sum);
        }
        for (SpamReport report : reports) {
            LocalDate date = LocalDate.ofInstant(report.getCreatedAt(), ZoneOffset.UTC);
            reportCounts.merge(date, 1L, Long::sum);
        }

        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        List<DailyAnalyticsPoint> points = new ArrayList<>();
        for (int index = 6; index >= 0; index--) {
            LocalDate day = today.minusDays(index);
            points.add(new DailyAnalyticsPoint(
                    day.format(DAY_FORMATTER),
                    searchCounts.getOrDefault(day, 0L),
                    reportCounts.getOrDefault(day, 0L)
            ));
        }
        return points;
    }

    private List<RegionStatistic> buildRegionStatistics(List<SearchHistory> searches) {
        Map<String, Long> counts = new LinkedHashMap<>();
        for (SearchHistory search : searches) {
            counts.merge(search.getRegion(), 1L, Long::sum);
        }

        return counts.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(6)
                .map(entry -> new RegionStatistic(entry.getKey(), entry.getValue()))
                .toList();
    }

    private List<RecentActivity> buildRecentActivity(List<SearchHistory> searches, List<SpamReport> reports) {
        List<RecentActivity> activity = new ArrayList<>();

        for (SearchHistory search : searches) {
            activity.add(new RecentActivity(
                    "Tracked " + search.getPhoneNumber(),
                    search.getOperatorName() + " in " + search.getRegion(),
                    "search",
                    search.getLastChecked()
            ));
        }
        for (SpamReport report : reports.stream().limit(10).toList()) {
            activity.add(new RecentActivity(
                    "Spam report added",
                    report.getPhoneNumber() + " flagged for " + report.getReason(),
                    "spam_report",
                    report.getCreatedAt()
            ));
        }

        return activity.stream()
                .sorted(Comparator.comparing(RecentActivity::occurredAt).reversed())
                .limit(8)
                .toList();
    }

    private List<SpamReportSummary> buildRecentReports(List<SpamReport> reports) {
        Map<String, SpamReportAccumulator> groupedReports = new LinkedHashMap<>();
        for (SpamReport report : reports) {
            groupedReports.compute(report.getPhoneNumber(), (phoneNumber, current) -> {
                if (current == null) {
                    return new SpamReportAccumulator(1, report.getReason(), report.getCreatedAt());
                }
                return current.increment(report.getReason(), report.getCreatedAt());
            });
        }

        return groupedReports.entrySet().stream()
                .map(entry -> {
                    PhoneLookupResult lookup = phoneNumberLookupService.lookupNormalized(entry.getKey(), entry.getValue().count());
                    return new SpamReportSummary(
                            entry.getKey(),
                            entry.getValue().count(),
                            entry.getValue().reason(),
                            lookup.spamScore(),
                            lookup.riskLevel(),
                            entry.getValue().lastReportedAt()
                    );
                })
                .sorted(Comparator.comparing(SpamReportSummary::lastReportedAt).reversed())
                .limit(8)
                .toList();
    }

    private record SpamReportAccumulator(long count, String reason, Instant lastReportedAt) {
        private SpamReportAccumulator increment(String latestReason, Instant latestReportedAt) {
            if (latestReportedAt.isAfter(lastReportedAt)) {
                return new SpamReportAccumulator(count + 1, latestReason, latestReportedAt);
            }
            return new SpamReportAccumulator(count + 1, reason, lastReportedAt);
        }
    }
}
