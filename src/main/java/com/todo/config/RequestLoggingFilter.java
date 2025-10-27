package com.todo.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Enumeration;

@Component
@Order(1)
@Slf4j
public class RequestLoggingFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        
        // Log request details
        log.info("=== INCOMING REQUEST ===");
        log.info("Method: {}", httpRequest.getMethod());
        log.info("URI: {}", httpRequest.getRequestURI());
        log.info("Query String: {}", httpRequest.getQueryString());
        log.info("Remote Address: {}", httpRequest.getRemoteAddr());
        log.info("User-Agent: {}", httpRequest.getHeader("User-Agent"));
        log.info("Content-Type: {}", httpRequest.getContentType());
        log.info("Content-Length: {}", httpRequest.getContentLength());
        
        // Log all headers
        log.info("Headers:");
        Enumeration<String> headerNames = httpRequest.getHeaderNames();
        while (headerNames.hasMoreElements()) {
            String headerName = headerNames.nextElement();
            String headerValue = httpRequest.getHeader(headerName);
            log.info("  {}: {}", headerName, headerValue);
        }
        
        // Check for suspicious requests (binary data in method)
        String method = httpRequest.getMethod();
        if (method != null && method.matches(".*[\\x00-\\x1F\\x7F-\\xFF].*")) {
            log.error("SUSPICIOUS REQUEST: Method contains binary data: {}", method);
            log.error("Raw method bytes: {}", java.util.Arrays.toString(method.getBytes()));
        }
        
        try {
            chain.doFilter(request, response);
        } catch (Exception e) {
            log.error("Error processing request: {}", e.getMessage(), e);
            throw e;
        }
        
        log.info("=== REQUEST COMPLETED ===");
    }
}
