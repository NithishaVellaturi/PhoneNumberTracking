package com.tracksecure.backend.api;

import java.util.Map;

public record ErrorDetails(String code, Map<String, String> fieldErrors) {
}
