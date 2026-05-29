package com.tracksecure.backend.controller;

import com.tracksecure.backend.api.ApiResponse;
import com.tracksecure.backend.dto.spam.CreateSpamReportRequest;
import com.tracksecure.backend.dto.tracking.SaveCallerLabelRequest;
import com.tracksecure.backend.dto.tracking.TrackNumberResponse;
import com.tracksecure.backend.dto.tracking.TrackNumberSummary;
import com.tracksecure.backend.security.AuthenticatedUser;
import com.tracksecure.backend.service.TrackingService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class TrackingController {

    private final TrackingService trackingService;

    public TrackingController(TrackingService trackingService) {
        this.trackingService = trackingService;
    }

    @GetMapping("/track-number")
    public ApiResponse<TrackNumberResponse> trackNumber(
            @AuthenticationPrincipal AuthenticatedUser principal,
            @RequestParam String phoneNumber,
            @RequestParam(required = false) String countryCode
    ) {
        return ApiResponse.success(
                "Phone number tracked successfully.",
                trackingService.trackNumber(principal.getId(), phoneNumber, countryCode)
        );
    }

    @PostMapping("/report-spam")
    public ApiResponse<TrackNumberResponse> reportSpam(
            @AuthenticationPrincipal AuthenticatedUser principal,
            @Valid @RequestBody CreateSpamReportRequest request
    ) {
        return ApiResponse.success(
                "Spam report submitted successfully.",
                trackingService.reportSpam(principal.getId(), request)
        );
    }

    @PostMapping("/caller-labels")
    public ApiResponse<TrackNumberResponse> saveCallerLabel(
            @AuthenticationPrincipal AuthenticatedUser principal,
            @Valid @RequestBody SaveCallerLabelRequest request
    ) {
        return ApiResponse.success(
                "Caller name saved successfully.",
                trackingService.saveCallerLabel(principal.getId(), request)
        );
    }

    @DeleteMapping("/caller-labels")
    public ApiResponse<TrackNumberResponse> removeCallerLabel(
            @AuthenticationPrincipal AuthenticatedUser principal,
            @RequestParam String phoneNumber,
            @RequestParam(required = false) String countryCode
    ) {
        return ApiResponse.success(
                "Caller name removed successfully.",
                trackingService.removeCallerLabel(principal.getId(), phoneNumber, countryCode)
        );
    }

    @GetMapping("/search-history")
    public ApiResponse<List<TrackNumberSummary>> searchHistory(@AuthenticationPrincipal AuthenticatedUser principal) {
        return ApiResponse.success(
                "Search history loaded.",
                trackingService.getSearchHistory(principal.getId())
        );
    }
}
