package com.brahmaniflower.shiprocket.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

import java.util.List;

/**
 * Request body for Shiprocket Create Order API.
 * POST /orders/create/adhoc
 * Based on Shiprocket API v1 documentation.
 */
@Data
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class ShiprocketCreateOrderRequest {

    @JsonProperty("order_id")
    private String orderId; // Our internal order number (idempotency key for Shiprocket)

    @JsonProperty("order_date")
    private String orderDate; // yyyy-MM-dd HH:mm

    @JsonProperty("pickup_location")
    private String pickupLocation;

    @JsonProperty("billing_customer_name")
    private String billingCustomerName;

    @JsonProperty("billing_address")
    private String billingAddress;

    @JsonProperty("billing_city")
    private String billingCity;

    @JsonProperty("billing_pincode")
    private String billingPincode;

    @JsonProperty("billing_state")
    private String billingState;

    @JsonProperty("billing_country")
    private String billingCountry;

    @JsonProperty("billing_email")
    private String billingEmail;

    @JsonProperty("billing_phone")
    private String billingPhone;

    @JsonProperty("shipping_is_billing")
    private Boolean shippingIsBilling;

    @JsonProperty("shipping_customer_name")
    private String shippingCustomerName;

    @JsonProperty("shipping_address")
    private String shippingAddress;

    @JsonProperty("shipping_city")
    private String shippingCity;

    @JsonProperty("shipping_pincode")
    private String shippingPincode;

    @JsonProperty("shipping_state")
    private String shippingState;

    @JsonProperty("shipping_country")
    private String shippingCountry;

    @JsonProperty("shipping_phone")
    private String shippingPhone;

    @JsonProperty("order_items")
    private List<OrderItem> orderItems;

    @JsonProperty("payment_method")
    private String paymentMethod; // "Prepaid" or "COD"

    @JsonProperty("sub_total")
    private Double subTotal;

    @JsonProperty("length")
    private Double length; // cm

    @JsonProperty("breadth")
    private Double breadth; // cm

    @JsonProperty("height")
    private Double height; // cm

    @JsonProperty("weight")
    private Double weight; // kg

    @Data
    @Builder
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class OrderItem {

        @JsonProperty("name")
        private String name;

        @JsonProperty("sku")
        private String sku;

        @JsonProperty("units")
        private Integer units;

        @JsonProperty("selling_price")
        private Double sellingPrice;

        @JsonProperty("discount")
        private Double discount;

        @JsonProperty("tax")
        private Double tax;

        @JsonProperty("hsn")
        private Integer hsn;
    }
}
