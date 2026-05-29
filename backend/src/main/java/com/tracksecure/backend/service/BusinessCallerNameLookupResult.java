package com.tracksecure.backend.service;

public record BusinessCallerNameLookupResult(String businessCallerName) {

    public static final BusinessCallerNameLookupResult UNAVAILABLE = new BusinessCallerNameLookupResult(null);

    public boolean available() {
        return businessCallerName != null && !businessCallerName.isBlank();
    }
}
