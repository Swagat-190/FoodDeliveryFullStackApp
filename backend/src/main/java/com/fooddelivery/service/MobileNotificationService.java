package com.fooddelivery.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;

/**
 * Sends free mobile notifications.
 *
 * Default mode is "log" to keep it zero-cost and deployment-safe.
 * Optional "textbelt" mode uses Textbelt free key (limited free quota).
 */
@Service
public class MobileNotificationService {

    private static final Logger log = LoggerFactory.getLogger(MobileNotificationService.class);

    private final HttpClient httpClient = HttpClient.newHttpClient();

    @Value("${notification.mobile.provider:log}")
    private String provider;

    @Value("${notification.mobile.textbelt.url:https://textbelt.com/text}")
    private String textbeltUrl;

    @Value("${notification.mobile.textbelt.key:textbelt}")
    private String textbeltKey;

    @Async
    public void sendNotificationAsync(String mobileNumber, String message) {
        sendToMobile(mobileNumber, message);
    }

    private void sendToMobile(String mobileNumber, String message) {
        if (mobileNumber == null || mobileNumber.isBlank()) {
            log.info("[MOBILE_NOTIFY] Skipped. No mobile number. Message: {}", message);
            return;
        }

        if ("textbelt".equalsIgnoreCase(provider)) {
            sendViaTextbelt(mobileNumber, message);
            return;
        }

        // Free default mode: logs notification payload without paid SMS provider.
        log.info("[MOBILE_NOTIFY][FREE-LOG] to={} message={}", mobileNumber, message);
    }

    private void sendViaTextbelt(String mobileNumber, String message) {
        try {
            String body = "phone=" + urlEncode(mobileNumber)
                    + "&message=" + urlEncode(message)
                    + "&key=" + urlEncode(textbeltKey);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(textbeltUrl))
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                log.warn("[MOBILE_NOTIFY] Textbelt request failed. status={} response={}", response.statusCode(), response.body());
            } else {
                log.info("[MOBILE_NOTIFY] Textbelt sent to {}", mobileNumber);
            }
        } catch (Exception ex) {
            log.warn("[MOBILE_NOTIFY] Textbelt send failed for {}. Falling back to log mode. reason={}", mobileNumber, ex.getMessage());
            log.info("[MOBILE_NOTIFY][FREE-LOG] to={} message={}", mobileNumber, message);
        }
    }

    private String urlEncode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}
