package com.tracksecure.backend.controller;

import com.tracksecure.backend.api.ApiResponse;
import com.tracksecure.backend.dto.phone.PhoneLookupResponse;
import com.tracksecure.backend.service.PhoneNumberLookupService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/phone")
public class PhoneLookupController {

    private final PhoneNumberLookupService phoneNumberLookupService;

    public PhoneLookupController(PhoneNumberLookupService phoneNumberLookupService) {
        this.phoneNumberLookupService = phoneNumberLookupService;
    }

    @GetMapping("/lookup")
    public ApiResponse<PhoneLookupResponse> lookup(
            @RequestParam String number,
            @RequestParam(required = false) String countryCode
    ) {
        return ApiResponse.success(
                "Phone intelligence loaded successfully.",
                phoneNumberLookupService.lookup(number, countryCode)
        );
    }
}
