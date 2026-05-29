package com.tracksecure.backend.service;

import com.tracksecure.backend.domain.CallerLabel;
import com.tracksecure.backend.domain.SearchHistory;
import com.tracksecure.backend.domain.SpamReport;
import com.tracksecure.backend.domain.UserAccount;
import com.tracksecure.backend.dto.spam.CreateSpamReportRequest;
import com.tracksecure.backend.dto.tracking.SaveCallerLabelRequest;
import com.tracksecure.backend.dto.tracking.TrackNumberResponse;
import com.tracksecure.backend.dto.tracking.TrackNumberSummary;
import com.tracksecure.backend.exception.ApiException;
import com.tracksecure.backend.repository.CallerLabelRepository;
import com.tracksecure.backend.repository.SearchHistoryRepository;
import com.tracksecure.backend.repository.SpamReportRepository;
import com.tracksecure.backend.repository.UserRepository;
import com.tracksecure.backend.util.InputSanitizer;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class TrackingService {

    private final UserRepository userRepository;
    private final CallerLabelRepository callerLabelRepository;
    private final SearchHistoryRepository searchHistoryRepository;
    private final SpamReportRepository spamReportRepository;
    private final PhoneNumberLookupService phoneNumberLookupService;
    private final PublicBusinessCallerNameService publicBusinessCallerNameService;
    private final InputSanitizer inputSanitizer;

    public TrackingService(
            UserRepository userRepository,
            CallerLabelRepository callerLabelRepository,
            SearchHistoryRepository searchHistoryRepository,
            SpamReportRepository spamReportRepository,
            PhoneNumberLookupService phoneNumberLookupService,
            PublicBusinessCallerNameService publicBusinessCallerNameService,
            InputSanitizer inputSanitizer
    ) {
        this.userRepository = userRepository;
        this.callerLabelRepository = callerLabelRepository;
        this.searchHistoryRepository = searchHistoryRepository;
        this.spamReportRepository = spamReportRepository;
        this.phoneNumberLookupService = phoneNumberLookupService;
        this.publicBusinessCallerNameService = publicBusinessCallerNameService;
        this.inputSanitizer = inputSanitizer;
    }

    public TrackNumberResponse trackNumber(UUID userId, String phoneNumber, String countryCode) {
        UserAccount user = requireUser(userId);
        PhoneLookupResult initialLookup = phoneNumberLookupService.lookup(phoneNumber, countryCode, 0);
        long reportCount = spamReportRepository.countByPhoneNumber(initialLookup.phoneNumber());
        PhoneLookupResult finalLookup = buildLookupResult(userId, initialLookup.phoneNumber(), reportCount);

        saveSearch(user, finalLookup);
        return finalLookup.toResponse();
    }

    public TrackNumberResponse reportSpam(UUID userId, CreateSpamReportRequest request) {
        UserAccount user = requireUser(userId);
        PhoneLookupResult initialLookup = phoneNumberLookupService.lookup(request.phoneNumber(), request.countryCode(), 0);

        SpamReport spamReport = new SpamReport();
        spamReport.setReporter(user);
        spamReport.setPhoneNumber(initialLookup.phoneNumber());
        spamReport.setReason(inputSanitizer.normalizePlainText(request.reason()));
        spamReport.setNotes(inputSanitizer.normalizePlainText(request.notes()));
        spamReportRepository.save(spamReport);

        long reportCount = spamReportRepository.countByPhoneNumber(initialLookup.phoneNumber());
        PhoneLookupResult updatedLookup = buildLookupResult(userId, initialLookup.phoneNumber(), reportCount);
        saveSearch(user, updatedLookup);
        return updatedLookup.toResponse();
    }

    public TrackNumberResponse saveCallerLabel(UUID userId, SaveCallerLabelRequest request) {
        UserAccount user = requireUser(userId);
        PhoneLookupResult initialLookup = phoneNumberLookupService.lookup(request.phoneNumber(), request.countryCode(), 0);
        String callerName = sanitizeCallerName(request.callerName());

        CallerLabel callerLabel = callerLabelRepository.findByUserIdAndPhoneNumber(userId, initialLookup.phoneNumber())
                .orElseGet(CallerLabel::new);
        callerLabel.setUser(user);
        callerLabel.setPhoneNumber(initialLookup.phoneNumber());
        callerLabel.setCallerName(callerName);
        callerLabelRepository.save(callerLabel);

        long reportCount = spamReportRepository.countByPhoneNumber(initialLookup.phoneNumber());
        return buildLookupResult(userId, initialLookup.phoneNumber(), reportCount).toResponse();
    }

    public TrackNumberResponse removeCallerLabel(UUID userId, String phoneNumber, String countryCode) {
        requireUser(userId);
        PhoneLookupResult initialLookup = phoneNumberLookupService.lookup(phoneNumber, countryCode, 0);
        callerLabelRepository.findByUserIdAndPhoneNumber(userId, initialLookup.phoneNumber())
                .ifPresent(callerLabelRepository::delete);

        long reportCount = spamReportRepository.countByPhoneNumber(initialLookup.phoneNumber());
        return buildLookupResult(userId, initialLookup.phoneNumber(), reportCount).toResponse();
    }

    public List<TrackNumberSummary> getSearchHistory(UUID userId) {
        requireUser(userId);
        List<SearchHistory> searchHistory = searchHistoryRepository.findTop50ByUserIdOrderByLastCheckedDesc(userId);
        Map<String, String> savedCallerNames = loadSavedCallerNames(userId, searchHistory);

        return searchHistory.stream()
                .map(history -> new TrackNumberSummary(
                        history.getId(),
                        history.getPhoneNumber(),
                        history.getCountryCode(),
                        phoneNumberLookupService.resolveCountryName(history.getPhoneNumber()),
                        savedCallerNames.containsKey(history.getPhoneNumber()),
                        savedCallerNames.get(history.getPhoneNumber()),
                        history.getBusinessCallerName(),
                        history.getOperatorName(),
                        history.getRegion(),
                        history.getLineType(),
                        history.getSpamScore(),
                        history.getReportCount(),
                        history.getRiskLevel(),
                        history.getLastChecked()
                ))
                .toList();
    }

    private void saveSearch(UserAccount user, PhoneLookupResult result) {
        SearchHistory searchHistory = new SearchHistory();
        searchHistory.setUser(user);
        searchHistory.setPhoneNumber(result.phoneNumber());
        searchHistory.setCountryCode(result.countryCode());
        searchHistory.setOperatorName(result.operator());
        searchHistory.setBusinessCallerName(result.businessCallerName());
        searchHistory.setRegion(result.region());
        searchHistory.setLineType(result.lineType());
        searchHistory.setSpamScore(result.spamScore());
        searchHistory.setReportCount(result.reportCount());
        searchHistory.setRiskLevel(result.riskLevel());
        searchHistory.setLastChecked(result.lastChecked());
        searchHistoryRepository.save(searchHistory);
    }

    private Map<String, String> loadSavedCallerNames(UUID userId, List<SearchHistory> searchHistory) {
        List<String> phoneNumbers = searchHistory.stream()
                .map(SearchHistory::getPhoneNumber)
                .distinct()
                .toList();
        if (phoneNumbers.isEmpty()) {
            return Map.of();
        }

        Map<String, String> savedCallerNames = new LinkedHashMap<>();
        for (CallerLabel callerLabel : callerLabelRepository.findByUserIdAndPhoneNumberIn(userId, phoneNumbers)) {
            savedCallerNames.put(callerLabel.getPhoneNumber(), callerLabel.getCallerName());
        }
        return savedCallerNames;
    }

    private PhoneLookupResult buildLookupResult(UUID userId, String normalizedPhoneNumber, long reportCount) {
        PhoneLookupResult lookupResult = phoneNumberLookupService.lookupNormalized(normalizedPhoneNumber, reportCount);
        lookupResult = enrichWithBusinessCallerName(lookupResult);
        return enrichWithSavedCallerData(userId, lookupResult);
    }

    private PhoneLookupResult enrichWithBusinessCallerName(PhoneLookupResult lookupResult) {
        BusinessCallerNameLookupResult callerNameLookup = publicBusinessCallerNameService.lookupBusinessCallerName(
                lookupResult.phoneNumber(),
                lookupResult.countryName()
        );
        return phoneNumberLookupService.withBusinessCallerName(
                lookupResult,
                callerNameLookup.businessCallerName()
        );
    }

    private PhoneLookupResult enrichWithSavedCallerData(UUID userId, PhoneLookupResult lookupResult) {
        Optional<CallerLabel> callerLabel = callerLabelRepository.findByUserIdAndPhoneNumber(userId, lookupResult.phoneNumber());
        String savedCallerName = callerLabel
                .map(CallerLabel::getCallerName)
                .filter(value -> !value.isBlank())
                .orElse(null);
        return phoneNumberLookupService.withSavedCallerData(lookupResult, callerLabel.isPresent(), savedCallerName);
    }

    private String sanitizeCallerName(String callerName) {
        String sanitizedCallerName = inputSanitizer.normalizePlainText(callerName);
        if (!sanitizedCallerName.isBlank() && sanitizedCallerName.length() < 2) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "invalid_caller_name", "Enter at least 2 characters for the caller name.");
        }
        return sanitizedCallerName;
    }

    private UserAccount requireUser(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "invalid_session", "User session is no longer valid."));
    }
}
