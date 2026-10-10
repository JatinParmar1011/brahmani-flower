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
            // cod=1 to get COD courier availability in the same call
            ShiprocketServiceabilityResponse response =
                    client.checkServiceability(pickupPincode, deliveryPincode, safeWeight, 1);

            if (response.isServiceable()) {
                ShiprocketServiceabilityResponse.CourierCompany best = pickBestCourier(response);

                BigDecimal charge = best != null && best.getRate() != null
                        ? BigDecimal.valueOf(best.getRate())
                        : BigDecimal.ZERO;
                String etd = best != null ? best.getEtd() : null;
                String courierName = best != null ? best.getCourierName() : null;

                // COD is available if at least one courier in the response has cod=1
                boolean codAvailable = response.getData().getAvailableCourierCompanies().stream()
                        .anyMatch(c -> Integer.valueOf(1).equals(c.getCod()));

                // Prepaid is always available when any courier is available
                return ServiceabilityResult.builder()
                        .destinationPincode(deliveryPincode)
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

            return ServiceabilityResult.builder()
                    .destinationPincode(deliveryPincode)
                    .serviceable(false)
                    .status(ServiceabilityStatus.NOT_SERVICEABLE)
                    .message("No courier service available to this pincode")
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
        UserAddress addr = order.getAddress();
        String fullAddress = buildFullAddress(addr);
        String orderDate   = order.getCreatedAt() != null
                ? order.getCreatedAt().format(ORDER_DATE_FMT)
                : LocalDateTime.now().format(ORDER_DATE_FMT);

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

        // Use actual shipment dimensions stored on the order.
        // These are set from product configs when the order is created.
        double totalWeightKg = order.getShipmentWeightKg() != null && order.getShipmentWeightKg().compareTo(BigDecimal.ZERO) > 0
                ? order.getShipmentWeightKg().doubleValue()
                : 0.5; // safety fallback
        double lengthCm  = order.getShipmentLengthCm()  != null && order.getShipmentLengthCm().compareTo(BigDecimal.ZERO)  > 0 ? order.getShipmentLengthCm().doubleValue()  : 10.0;
        double breadthCm = order.getShipmentBreadthCm() != null && order.getShipmentBreadthCm().compareTo(BigDecimal.ZERO) > 0 ? order.getShipmentBreadthCm().doubleValue() : 10.0;
        double heightCm  = order.getShipmentHeightCm()  != null && order.getShipmentHeightCm().compareTo(BigDecimal.ZERO)  > 0 ? order.getShipmentHeightCm().doubleValue()  : 10.0;

        return ShiprocketCreateOrderRequest.builder()
                .orderId(order.getOrderNumber())
                .orderDate(orderDate)
                .pickupLocation(props.getPickupLocation())
                .billingCustomerName(addr.getFullName())
                .billingAddress(fullAddress)
                .billingCity(addr.getCity())
                .billingPincode(addr.getPincode())
                .billingState(addr.getState())
                .billingCountry(addr.getCountry())
                .billingEmail(order.getUser().getEmail() != null ? order.getUser().getEmail() : "")
                .billingPhone(addr.getMobileNumber())
                .shippingIsBilling(true)
                .shippingCustomerName(addr.getFullName())
                .shippingAddress(fullAddress)
                .shippingCity(addr.getCity())
                .shippingPincode(addr.getPincode())
                .shippingState(addr.getState())
                .shippingCountry(addr.getCountry())
                .shippingPhone(addr.getMobileNumber())
                .orderItems(items)
                .paymentMethod("Prepaid")
                .subTotal(order.getTotalAmount().doubleValue())
                .length(lengthCm)
                .breadth(breadthCm)
                .height(heightCm)
                .weight(totalWeightKg)
                .build();
    }

    private String buildFullAddress(UserAddress addr) {
        StringBuilder sb = new StringBuilder(addr.getAddress1());
        if (addr.getAddress2() != null && !addr.getAddress2().isBlank()) {
            sb.append(", ").append(addr.getAddress2());
        }
        return sb.toString();
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
