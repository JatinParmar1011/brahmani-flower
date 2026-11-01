package com.brahmaniflower.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Typed configuration for Shiprocket integration.
 *
 * Based on official Shiprocket API docs: https://apidocs.shiprocket.in/
 *
 * Authentication:
 *   - POST {baseUrl}/auth/login  with { "email": "...", "password": "..." }
 *   - Response contains { "token": "..." }  (JWT, valid 10 days / 240 hours)
 *   - Use as: Authorization: Bearer <token>
 *
 * Two credential modes (in priority order):
 *   1. Static token  — set shiprocket.token; skips the login API call entirely.
 *   2. Email+password — set shiprocket.email + shiprocket.password; token is
 *      fetched automatically and cached for TOKEN_TTL_HOURS (9 days by default,
 *      safely under the 10-day expiry).
 *
 * Credentials MUST be injected via environment variables or secrets management
 * in production. NEVER commit real credentials to version control.
 */
@Configuration
@ConfigurationProperties(prefix = "shiprocket")
@Getter @Setter
public class ShiprocketProperties {

    /**
     * Shiprocket API base URL including the /v1/external path.
     * Official production URL: https://apiv2.shiprocket.in/v1/external
     */
    private String baseUrl = "https://apiv2.shiprocket.in/v1/external";

    /** Shiprocket account email (used for POST /auth/login). */
    private String email;

    /**
     * Shiprocket account plain-text password (used for POST /auth/login).
     * Must be the actual password — NOT an MD5 hash.
     * Create a dedicated API user at: Settings > API > Add New API User.
     */
    private String password;

    /**
     * Optional: pre-generated static token from the Shiprocket dashboard.
     * When set, the login API call is skipped entirely.
     * Leave blank to use the email+password login flow.
     * Token validity is 10 days; regenerate it before it expires.
     */
    private String token;

    /**
     * Name of the pickup/warehouse location as configured in Shiprocket.
     * Go to Settings > Manage Warehouses to verify the exact name.
     */
    private String pickupLocation = "Primary";

    /** Pincode of the warehouse/pickup location. */
    private String pickupPincode;

    /** HTTP connection timeout in milliseconds. */
    private int connectTimeoutMs = 5000;

    /** HTTP read/response timeout in milliseconds. */
    private int readTimeoutMs = 10000;

    /** Maximum retry attempts for transient failures (not applied to 4xx errors). */
    private int maxRetries = 2;

    /** Serviceability result cache TTL in minutes (Redis). */
    private int serviceabilityCacheTtlMinutes = 30;

    /** Webhook secret for validating Shiprocket webhook callbacks. */
    private String webhookSecret;

    /** Interval in minutes for polling active shipment statuses. */
    private int syncIntervalMinutes = 30;
}
