package com.brahmaniflower.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Typed configuration for Shiprocket integration.
 * All properties are sourced from application.properties (prefix "shiprocket").
 * Credentials MUST be injected via environment variables or secrets management in production.
 */
@Configuration
@ConfigurationProperties(prefix = "shiprocket")
@Getter @Setter
public class ShiprocketProperties {

    /** Shiprocket API base URL */
    private String baseUrl = "https://apiv2.shiprocket.in/v1/external";

    /** Registered Shiprocket account email */
    private String email;

    /** Registered Shiprocket account password */
    private String password;

    /** Name of the pickup location as configured in Shiprocket */
    private String pickupLocation = "Primary";

    /** Pincode of the warehouse/pickup location */
    private String pickupPincode;

    /** HTTP connection timeout in milliseconds */
    private int connectTimeoutMs = 5000;

    /** HTTP read timeout in milliseconds */
    private int readTimeoutMs = 10000;

    /** Maximum retry attempts for transient failures */
    private int maxRetries = 2;

    /** Serviceability cache TTL in minutes */
    private int serviceabilityCacheTtlMinutes = 30;

    /** Webhook secret for request validation */
    private String webhookSecret;

    /** Shipment status sync interval in minutes */
    private int syncIntervalMinutes = 30;
}
