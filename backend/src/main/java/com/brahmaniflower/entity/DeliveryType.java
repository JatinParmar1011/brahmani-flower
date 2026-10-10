package com.brahmaniflower.entity;

/**
 * Defines how delivery eligibility is determined for a product.
 *
 * CITY_BASED    — product can only be delivered to configured cities.
 * PINCODE_BASED — product delivery is validated against destination pincode via Shiprocket.
 */
public enum DeliveryType {
    CITY_BASED,
    PINCODE_BASED
}
