package com.tracksecure.backend.controller;

import com.tracksecure.backend.api.ApiResponse;
import com.tracksecure.backend.dto.dashboard.DashboardStatsResponse;
import com.tracksecure.backend.dto.dashboard.DashboardTrendsResponse;
import com.tracksecure.backend.service.DashboardService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/stats")
    public ApiResponse<DashboardStatsResponse> dashboardStats() {
        return ApiResponse.success("Dashboard statistics loaded.", dashboardService.getDashboardStats());
    }

    @GetMapping("/trends")
    public ApiResponse<DashboardTrendsResponse> dashboardTrends() {
        return ApiResponse.success("Dashboard trends loaded.", dashboardService.getDashboardTrends());
    }
}
