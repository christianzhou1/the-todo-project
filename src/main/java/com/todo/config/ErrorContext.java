package com.todo.config;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Error context for Root Cause Analysis (RCA)
 * Captures comprehensive information about errors for analysis
 */
@Data
@Builder
public class ErrorContext {
    private String correlationId;
    private String userId;
    private String requestId;
    private String method;
    private String path;
    private String queryString;
    private Map<String, String> headers;
    private String requestBody;
    private String responseBody;
    private String exceptionType;
    private String exceptionMessage;
    private String stackTrace;
    private LocalDateTime timestamp;
    private String environment;
    private String version;
    private Map<String, Object> additionalContext;

    /**
     * Convert to map for logging/export
     */
    public Map<String, Object> toMap() {
        Map<String, Object> map = new HashMap<>();
        map.put("correlationId", correlationId);
        map.put("userId", userId);
        map.put("requestId", requestId);
        map.put("method", method);
        map.put("path", path);
        map.put("queryString", queryString);
        map.put("headers", headers);
        map.put("requestBody", requestBody);
        map.put("responseBody", responseBody);
        map.put("exceptionType", exceptionType);
        map.put("exceptionMessage", exceptionMessage);
        map.put("stackTrace", stackTrace);
        map.put("timestamp", timestamp != null ? timestamp.toString() : null);
        map.put("environment", environment);
        map.put("version", version);
        if (additionalContext != null) {
            map.putAll(additionalContext);
        }
        return map;
    }
}

