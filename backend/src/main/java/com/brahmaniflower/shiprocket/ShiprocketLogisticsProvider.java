package com.brahmaniflower.shiprocket;

import com.brahmaniflower.config.ShiprocketProperties;
import com.brahmaniflower.dto.response.ServiceabilityResult;
import com.brahmaniflower.dto.response.ShipmentCreationResult;
import com.brahmaniflower.dto.response.TrackingResult;
import com.brahmaniflower.entity.*;
import com.brahmaniflower.service.LogisticsProvider;
import com.brahmaniflower.shiprocket.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Shiprocket implementation of the LogisticsProvider interface.
 *
 * Responsibilities:
 * - Adapts between our domain model and Shiprocket DTOs.
 * - Normalizes Shiprocket responses into our internal result types.
 * - Uses ShiprocketClient for actual HTTP calls.
 * - Uses ShiprocketStatusMapper for status translation.
 *
 * Business logic lives in DeliveryServiceabilityService, not here.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ShiprocketLogisticsProvider implements LogisticsProvider {

    private static final DateTimeFormatter ORDER_DATE_FMT =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    private final ShiprocketClient       client;
    private final ShiprocketProperties   props;
    private final ShiprocketStatusMapper statusMapper;

    @Override
    public String providerName() {
        return "Shiprocket";
    }

    // ── Serviceability ───────────────────────────────────────────────────────

    @Override
    public ServiceabilityResult checkServiceability(String pickupPincode, String deliveryPincode,
                                                    double totalWeightKg) {
        // Ensure weight is positive; fall back to 0.5 kg minimum if something goes wrong upstream
        double safeWeight = totalWeightKg > 0 ? totalWeightKg : 0.5;
        try {
            // cod=1: ask Shiprocket to include COD-eligible couriers in the response
            ShiprocketServiceabilityResponse response =
                    client.checkServiceability(pickupPincode, deliveryPincode, safeWeight, 1);

            // Handle Shiprocket's 422 = invalid pincode format
            if (response.isInvalidPincode()) {
                log.info("[Shiprocket] Pincode {} is invalid (422 from Shiprocket)", deliveryPincode);
                return ServiceabilityResult.builder()
                        .destinationPincode(deliveryPincode)
                        .serviceable(false)
                        .status(ServiceabilityStatus.INVALID_PINCODE)
                        .message("Invalid pincode. Please enter a valid 6-digit pincode.")
                        .codAvailable(false)
                        .prepaidAvailable(false)
                        .build();
            }

            // Handle 404 = pincode not found in Shiprocket's database
            if (response.isNotFound()) {
                log.info("[Shiprocket] Pincode {} not found in Shiprocket coverage (404)", deliveryPincode);
                return ServiceabilityResult.builder()
                        .destinationPincode(deliveryPincode)
                        .serviceable(false)
                        .status(ServiceabilityStatus.NOT_SERVICEABLE)
                        .message("No delivery service available to this pincode.")
                        .codAvailable(false)
                        .prepaidAvailable(false)
                        .build();
            }

            if (response.isServiceable()) {
                ShiprocketServiceabilityResponse.CourierCompany best = pickBestCourier(response);

                BigDecimal charge = best != null && best.getRate() != null
                        ? BigDecimal.valueOf(best.getRate())
                        : BigDecimal.ZERO;
                String etd        = best != null ? best.getEtd() : null;
                String courierName = best != null ? best.getCourierName() : null;

                // COD is available if at least one courier in the response has cod=1
                boolean codAvailable = response.getData().getAvailableCourierCompanies().stream()
                        .anyMatch(c -> Integer.valueOf(1).equals(c.getCod()));

                // Extract city/state from Shiprocket's response (resolved from pincode)
                String city  = response.getData().getDeliveryCityName();
                String state = response.getData().getDeliveryStateName();

                log.info("[Shiprocket] Pincode {} serviceable. Couriers: {}, Best: {}, Rate: ₹{}, COD: {}",
                        deliveryPincode,
                        response.getData().getAvailableCourierCompanies().size(),
                        courierName, charge, codAvailable);

                return ServiceabilityResult.builder()
                        .destinationPincode(deliveryPincode)
                        .city(city)
                        .state(state)
                        .serviceable(true)
                        .status(ServiceabilityStatus.SERVICEABLE)
                        .message("Delivery available")
                        .deliveryCharge(charge)
                        .estimatedDeliveryDate(etd)
                        .courierName(courierName)
                        .codAvailable(codAvailable)
                        .prepaidAvailable(true)
                        .build();
            }

            // Response was 200 but no couriers available — not serviceable
            log.info("[Shiprocket] Pincode {} returned 200 but no available couriers", deliveryPincode);
            return ServiceabilityResult.builder()
                    .destinationPincode(deliveryPincode)
                    .serviceable(false)
                    .status(ServiceabilityStatus.NOT_SERVICEABLE)
                    .message("No courier service available to this pincode.")
                    .codAvailable(false)
                    .prepaidAvailable(false)
                    .build();

        } catch (ShiprocketException e) {
            log.error("[Shiprocket] Serviceability check failed for pincode {}: {}",
                    deliveryPincode, e.getMessage());
            return ServiceabilityResult.builder()
                    .destinationPincode(deliveryPincode)
                    .serviceable(false)
                    .status(ServiceabilityStatus.TEMPORARILY_UNAVAILABLE)
                    .message("Delivery serviceability temporarily unavailable. Please try again.")
                    .build();
        } catch (Exception e) {
            log.error("[Shiprocket] Unexpected error during serviceability check: {}", e.getMessage());
            return ServiceabilityResult.builder()
                    .destinationPincode(deliveryPincode)
                    .serviceable(false)
                    .status(ServiceabilityStatus.PROVIDER_ERROR)
                    .message("Unable to check delivery availability. Please try again.")
                    .build();
        }
    }

    // ── Shipment creation ────────────────────────────────────────────────────

    @Override
    public ShipmentCreationResult createShipment(Order order) {
        try {
            ShiprocketCreateOrderRequest request = buildCreateOrderRequest(order);
            ShiprocketCreateOrderResponse response = client.createOrder(request);

            if (response.isSuccess()) {
                return ShipmentCreationResult.builder()
                        .success(true)
                        .shiprocketOrderId(String.valueOf(response.getOrderId()))
                        .shiprocketShipmentId(String.valueOf(response.getShipmentId()))
                        .awbCode(response.getAwbCode())
                        .courierName(response.getCourierName())
                        .pickupScheduledDate(response.getPickupScheduledDate())
                        .estimatedDeliveryDate(response.getPromisedDeliveryDate())
                        .build();
            }

            return ShipmentCreationResult.builder()
                    .success(false)
                    .errorMessage("Shiprocket order creation returned status: " + response.getStatus())
                    .build();

        } catch (ShiprocketException e) {
            log.error("[Shiprocket] Shipment creation failed for order {}: {}",
                    order.getOrderNumber(), e.getMessage());
            return ShipmentCreationResult.builder()
                    .success(false)
                    .errorMessage(e.getMessage())
                    .build();
        } catch (Exception e) {
            log.error("[Shiprocket] Unexpected shipment creation error for order {}: {}",
                    order.getOrderNumber(), e.getMessage());
            return ShipmentCreationResult.builder()
                    .success(false)
                    .errorMessage("Unexpected error: " + e.getMessage())
                    .build();
        }
    }

    // ── Tracking ─────────────────────────────────────────────────────────────

    @Override
    public TrackingResult trackByAwb(String awbCode) {
        try {
            ShiprocketTrackingResponse response = client.trackByAwb(awbCode);
            return mapTrackingResponse(awbCode, response);
        } catch (ShiprocketException e) {
            log.error("[Shiprocket] Tracking failed for AWB {}: {}", awbCode, e.getMessage());
            return TrackingResult.builder()
                    .awbCode(awbCode)
                    .found(false)
                    .errorMessage("Tracking temporarily unavailable. Please try again.")
                    .build();
        }
    }

    @Override
    public TrackingResult trackByShipmentId(String shipmentId) {
        try {
            ShiprocketTrackingResponse response = client.trackByShipmentId(shipmentId);
            return mapTrackingResponse(null, response);
        } catch (ShiprocketException e) {
            log.error("[Shiprocket] Tracking failed for shipment_id {}: {}", shipmentId, e.getMessage());
            return TrackingResult.builder()
                    .found(false)
                    .errorMessage("Tracking temporarily unavailable. Please try again.")
                    .build();
        }
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    private ShiprocketCreateOrderRequest buildCreateOrderRequest(Order order) {
        // Use snapshotted address if available (historical accuracy);
        // fall back to live address only if snapshot is missing.
        String fullName   = order.getSnapFullName()  != null ? order.getSnapFullName()  : (order.getAddress() != null ? order.getAddress().getFullName()   : "");
        String mobile     = order.getSnapMobile()    != null ? order.getSnapMobile()    : (order.getAddress() != null ? order.getAddress().getMobileNumber() : "");
        String addr1      = order.getSnapAddress1()  != null ? order.getSnapAddress1()  : (order.getAddress() != null ? order.getAddress().getAddress1()     : "");
        String addr2      = order.getSnapAddress2();
        String city       = order.getSnapCity()      != null ? order.getSnapCity()      : (order.getAddress() != null ? order.getAddress().getCity()          : "");
        String state      = order.getSnapState()     != null ? order.getSnapState()     : (order.getAddress() != null ? order.getAddress().getState()         : "");
        String pincode    = order.getSnapPincode()   != null ? order.getSnapPincode()   : (order.getAddress() != null ? order.getAddress().getPincode()        : "");
        String country    = order.getSnapCountry()   != null ? order.getSnapCountry()   : (order.getAddress() != null ? order.getAddress().getCountry()        : "India");

        String fullAddress = addr1 + (addr2 != null && !addr2.isBlank() ? ", " + addr2 : "");

        String orderDate = order.getCreatedAt() != null
                ? order.getCreatedAt().format(ORDER_DATE_FMT)
                : LocalDateTime.now().format(ORDER_DATE_FMT);

        // Build order items list per Shiprocket API spec
        List<ShiprocketCreateOrderRequest.OrderItem> items = order.getItems().stream()
                .map(oi -> ShiprocketCreateOrderRequest.OrderItem.builder()
                        .name(oi.getProductName())
                        .sku("PROD-" + oi.getProduct().getId())
                        .units(oi.getQuantity())
                        .sellingPrice(oi.getUnitPrice().doubleValue())
                        .discount(0.0)
                        .tax(0.0)
                        .hsn(0)
                        .build())
                .collect(Collectors.toList());

        // Use snapshotted shipment dimensions from order (set at checkout from product configs)
        double totalWeightKg = (order.getShipmentWeightKg() != null
                && order.getShipmentWeightKg().compareTo(java.math.BigDecimal.ZERO) > 0)
                ? order.getShipmentWeightKg().doubleValue() : 0.5;
        double lengthCm  = (order.getShipmentLengthCm()  != null
                && order.getShipmentLengthCm().compareTo(java.math.BigDecimal.ZERO)  > 0)
                ? order.getShipmentLengthCm().doubleValue()  : 10.0;
        double breadthCm = (order.getShipmentBreadthCm() != null
                && order.getShipmentBreadthCm().compareTo(java.math.BigDecimal.ZERO) > 0)
                ? order.getShipmentBreadthCm().doubleValue() : 10.0;
        double heightCm  = (order.getShipmentHeightCm()  != null
                && order.getShipmentHeightCm().compareTo(java.math.BigDecimal.ZERO)  > 0)
                ? order.getShipmentHeightCm().doubleValue()  : 10.0;

        String email = (order.getUser() != null && order.getUser().getEmail() != null)
                ? order.getUser().getEmail() : "";

        log.debug("[Shiprocket] Building order request: order={} weight={}kg to={} {}",
                order.getOrderNumber(), totalWeightKg, city, pincode);

        return ShiprocketCreateOrderRequest.builder()
                // order_id is our order number — Shiprocket uses this as idempotency key
                .orderId(order.getOrderNumber())
                .orderDate(orderDate)
                .pickupLocation(props.getPickupLocation())
                // Billing details
                .billingCustomerName(fullName)
                .billingAddress(fullAddress)
                .billingCity(city)
                .billingPincode(pincode)
                .billingState(state)
                .billingCountry(country)
                .billingEmail(email)
                .billingPhone(mobile)
                // Shipping = billing (same delivery address)
                .shippingIsBilling(true)
                .shippingCustomerName(fullName)
                .shippingAddress(fullAddress)
                .shippingCity(city)
                .shippingPincode(pincode)
                .shippingState(state)
                .shippingCountry(country)
                .shippingPhone(mobile)
                // Order items
                .orderItems(items)
                // Payment method
                .paymentMethod("Prepaid")
                // Financial
                .subTotal(order.getTotalAmount().doubleValue())
                // Physical dimensions (required by Shiprocket for weight-based rate calculation)
                .length(lengthCm)
                .breadth(breadthCm)
                .height(heightCm)
                .weight(totalWeightKg)
                .build();
    }

    private TrackingResult mapTrackingResponse(String awbCode, ShiprocketTrackingResponse response) {
        var data = response.getTrackingData();
        if (data == null || data.getTrackStatus() == null) {
            return TrackingResult.builder()
                    .awbCode(awbCode)
                    .found(false)
                    .errorMessage("No tracking data available")
                    .build();
        }

        // Get current status from track record
        String currentProviderStatus = null;
        String edd = null;
        String trackUrl = data.getTrackUrl();

        if (data.getShipmentTrack() != null && !data.getShipmentTrack().isEmpty()) {
            var track = data.getShipmentTrack().get(0);
            currentProviderStatus = track.getCurrentStatus();
            edd = track.getEdd();
            if (awbCode == null) awbCode = track.getAwbCode();
        }

        ShipmentStatus status = statusMapper.map(currentProviderStatus);
        String label = statusMapper.getLabel(status);

        // Map activity events
        List<TrackingResult.TrackEvent> events = null;
        if (data.getShipmentTrackActivities() != null) {
            events = data.getShipmentTrackActivities().stream()
                    .map(a -> TrackingResult.TrackEvent.builder()
                            .date(a.getDate())
                            .activity(a.getActivity())
                            .location(a.getLocation())
                            .status(a.getSrStatusLabel())
                            .build())
                    .collect(Collectors.toList());
        }

        return TrackingResult.builder()
                .awbCode(awbCode)
                .currentStatus(status)
                .currentStatusLabel(label)
                .estimatedDeliveryDate(edd)
                .trackUrl(trackUrl)
                .events(events)
                .found(true)
                .build();
    }

    private ShiprocketServiceabilityResponse.CourierCompany pickBestCourier(
            ShiprocketServiceabilityResponse response) {

        if (response.getData() == null
                || response.getData().getAvailableCourierCompanies() == null
                || response.getData().getAvailableCourierCompanies().isEmpty()) {
            return null;
        }

        // Prefer the Shiprocket-recommended courier; fall back to cheapest
        Integer recommendedId = response.getData().getShiprocketRecommendedCourierId();
        if (recommendedId != null) {
            return response.getData().getAvailableCourierCompanies().stream()
                    .filter(c -> recommendedId.equals(c.getCourierCompanyId()))
                    .findFirst()
                    .orElse(response.getData().getAvailableCourierCompanies().get(0));
        }

        return response.getData().getAvailableCourierCompanies().stream()
                .min((a, b) -> {
                    double ra = a.getRate() != null ? a.getRate() : Double.MAX_VALUE;
                    double rb = b.getRate() != null ? b.getRate() : Double.MAX_VALUE;
                    return Double.compare(ra, rb);
                })
                .orElse(response.getData().getAvailableCourierCompanies().get(0));
    }
}
