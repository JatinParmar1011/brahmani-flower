package com.brahmaniflower.service.impl;

import com.brahmaniflower.dto.response.ShipmentCreationResult;
import com.brahmaniflower.dto.response.ShipmentResponse;
import com.brahmaniflower.dto.response.TrackingResult;
import com.brahmaniflower.entity.*;
import com.brahmaniflower.exception.BadRequestException;
import com.brahmaniflower.exception.ResourceNotFoundException;
import com.brahmaniflower.repository.*;
import com.brahmaniflower.service.LogisticsProvider;
import com.brahmaniflower.service.ShipmentService;
import com.brahmaniflower.shiprocket.ShiprocketStatusMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ShipmentServiceImpl implements ShipmentService {

    private final ShipmentRepository             shipmentRepository;
    private final ShipmentStatusHistoryRepository historyRepository;
    private final OrderRepository                orderRepository;
    private final OrderStatusHistoryRepository   orderStatusHistoryRepository;
    private final UserRepository                 userRepository;
    private final LogisticsProvider              logisticsProvider;
    private final ShiprocketStatusMapper         statusMapper;

    // ── Create shipment ───────────────────────────────────────────────────────

    @Override
    @Transactional
    public Shipment createShipmentForOrder(Order order) {
        // Idempotency: return existing shipment if it already has a Shiprocket reference
        return shipmentRepository.findByOrderId(order.getId()).map(existing -> {
            if (existing.getShiprocketOrderId() != null) {
                log.info("[Shipment] Shipment already exists for order {} with Shiprocket order_id={}",
                        order.getOrderNumber(), existing.getShiprocketOrderId());
                return existing;
            }
            // Retry creation for shipments without Shiprocket reference
            return attemptShiprocketCreation(existing, order);
        }).orElseGet(() -> {
            // First attempt
            Shipment shipment = new Shipment();
            shipment.setOrder(order);
            shipment.setShipmentStatus(ShipmentStatus.CREATED);
            Shipment saved = shipmentRepository.save(shipment);

            appendStatusHistory(saved, null, ShipmentStatus.CREATED.name(), null, "SYSTEM", null);
            return attemptShiprocketCreation(saved, order);
        });
    }

    private Shipment attemptShiprocketCreation(Shipment shipment, Order order) {
        shipment.setCreationAttempts(shipment.getCreationAttempts() + 1);

        ShipmentCreationResult result = logisticsProvider.createShipment(order);

        if (result.isSuccess()) {
            shipment.setShiprocketOrderId(result.getShiprocketOrderId());
            shipment.setShiprocketShipmentId(result.getShiprocketShipmentId());
            shipment.setAwbCode(result.getAwbCode());
            shipment.setCourierName(result.getCourierName());
            shipment.setShipmentStatus(ShipmentStatus.PICKUP_PENDING);
            shipment.setErrorMessage(null);

            if (result.getPickupScheduledDate() != null && !result.getPickupScheduledDate().isBlank()) {
                try {
                    shipment.setPickupScheduledDate(LocalDate.parse(result.getPickupScheduledDate().substring(0, 10)));
                } catch (Exception ignored) {}
            }
            if (result.getEstimatedDeliveryDate() != null && !result.getEstimatedDeliveryDate().isBlank()) {
                try {
                    shipment.setEstimatedDeliveryDate(LocalDate.parse(result.getEstimatedDeliveryDate().substring(0, 10)));
                } catch (Exception ignored) {}
            }
            if (result.getShippingCharge() != null) {
                shipment.setShippingCharge(result.getShippingCharge());
                // FIX (Issue 5): Also update the order's recorded shipping charge so it is
                // correct in order history, responses, and invoices. The order was initially
                // saved with shippingCharge=ZERO before Shiprocket confirmed the rate.
                Order orderToUpdate = shipment.getOrder();
                if (orderToUpdate != null) {
                    orderToUpdate.setShippingCharge(result.getShippingCharge());
                    orderRepository.save(orderToUpdate);
                    log.info("[Shipment] Order {} shipping charge updated to ₹{}",
                            orderToUpdate.getOrderNumber(), result.getShippingCharge());
                }
            }

            appendStatusHistory(shipment, ShipmentStatus.CREATED.name(),
                    ShipmentStatus.PICKUP_PENDING.name(), null, "SYSTEM",
                    "Shiprocket shipment created: " + result.getShiprocketOrderId());

            log.info("[Shipment] Shiprocket shipment created for order {}: sr_order_id={} awb={}",
                    order.getOrderNumber(), result.getShiprocketOrderId(), result.getAwbCode());
        } else {
            shipment.setErrorMessage(result.getErrorMessage());
            log.warn("[Shipment] Shiprocket creation failed for order {}: {}",
                    order.getOrderNumber(), result.getErrorMessage());
        }

        return shipmentRepository.save(shipment);
    }

    // ── Status update ─────────────────────────────────────────────────────────

    @Override
    @Transactional
    public void updateShipmentStatus(Shipment shipment, String providerStatus, String source) {
        ShipmentStatus newStatus = statusMapper.map(providerStatus);
        ShipmentStatus oldStatus = shipment.getShipmentStatus();

        if (oldStatus == newStatus) {
            log.debug("[Shipment] Status unchanged for shipment {}: {}", shipment.getId(), newStatus);
            return;
        }

        // Terminal states: do not regress
        if (oldStatus == ShipmentStatus.DELIVERED
                || oldStatus == ShipmentStatus.RTO_DELIVERED
                || oldStatus == ShipmentStatus.CANCELLED) {
            log.warn("[Shipment] Ignoring status update for terminal shipment {}: {} -> {}",
                    shipment.getId(), oldStatus, newStatus);
            return;
        }

        log.info("[Shipment] Shipment {} status: {} -> {} (provider: '{}')",
                shipment.getId(), oldStatus, newStatus, providerStatus);

        shipment.setShipmentStatus(newStatus);
        appendStatusHistory(shipment, oldStatus.name(), newStatus.name(), providerStatus, source, null);

        // Propagate to order status
        Order.OrderStatus derivedOrderStatus = statusMapper.deriveOrderStatus(newStatus);
        if (derivedOrderStatus != null) {
            updateOrderStatusFromShipment(shipment.getOrder(), derivedOrderStatus, source);
        }

        shipmentRepository.save(shipment);
    }

    // ── Tracking ─────────────────────────────────────────────────────────────

    @Override
    public TrackingResult getTrackingForOrder(Long orderId, String userIdentifier) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));

        // Authorization check
        if (userIdentifier != null) {
            User user = resolveUser(userIdentifier);
            if (!order.getUser().getId().equals(user.getId())) {
                throw new BadRequestException("Access denied to this order");
            }
        }

        Shipment shipment = shipmentRepository.findByOrderId(orderId).orElse(null);
        if (shipment == null || shipment.getAwbCode() == null) {
            return TrackingResult.builder()
                    .orderId(String.valueOf(orderId))
                    .orderNumber(order.getOrderNumber())
                    .found(false)
                    .errorMessage("Tracking information not yet available for this order")
                    .build();
        }

        TrackingResult result = logisticsProvider.trackByAwb(shipment.getAwbCode());
        result.setOrderId(String.valueOf(orderId));
        result.setOrderNumber(order.getOrderNumber());
        return result;
    }

    // ── Queries ───────────────────────────────────────────────────────────────

    @Override
    public ShipmentResponse getShipmentForOrder(Long orderId, String userIdentifier) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));

        User user = resolveUser(userIdentifier);
        if (!order.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Access denied");
        }

        return buildResponse(order, shipmentRepository.findByOrderId(orderId).orElse(null), false);
    }

    @Override
    public ShipmentResponse getShipmentForAdmin(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));
        return buildResponse(order, shipmentRepository.findByOrderId(orderId).orElse(null), true);
    }

    // ── Polling sync ─────────────────────────────────────────────────────────

    @Override
    @Transactional
    public void syncShipmentStatus(Shipment shipment) {
        if (shipment.getAwbCode() == null && shipment.getShiprocketShipmentId() == null) {
            log.debug("[Shipment] Cannot sync shipment {} — no AWB or Shiprocket shipment ID", shipment.getId());
            return;
        }

        try {
            TrackingResult result = shipment.getAwbCode() != null
                    ? logisticsProvider.trackByAwb(shipment.getAwbCode())
                    : logisticsProvider.trackByShipmentId(shipment.getShiprocketShipmentId());

            if (result.isFound() && result.getCurrentStatus() != null) {
                String providerStatus = result.getCurrentStatusLabel();
                updateShipmentStatus(shipment, providerStatus, "POLLING");
            }

            shipment.setSyncAttempts(shipment.getSyncAttempts() + 1);
            java.time.LocalDateTime now = java.time.LocalDateTime.now();
            shipment.setLastSyncedAt(now);
            shipmentRepository.save(shipment);

        } catch (Exception e) {
            log.error("[Shipment] Sync failed for shipment {}: {}", shipment.getId(), e.getMessage());
            shipment.setSyncAttempts(shipment.getSyncAttempts() + 1);
            shipment.setLastSyncedAt(java.time.LocalDateTime.now());
            shipmentRepository.save(shipment);
        }
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private void updateOrderStatusFromShipment(Order order, Order.OrderStatus newOrderStatus, String source) {
        if (order == null) return;
        Order.OrderStatus currentStatus = order.getStatus();

        if (currentStatus == newOrderStatus) return;
        if (!Order.isValidTransition(currentStatus, newOrderStatus)) {
            log.warn("[Shipment] Invalid order status transition {} -> {} for order {}. Skipping.",
                    currentStatus, newOrderStatus, order.getOrderNumber());
            return;
        }

        log.info("[Shipment] Order {} status: {} -> {} (triggered by shipment {})",
                order.getOrderNumber(), currentStatus, newOrderStatus, source);

        order.setStatus(newOrderStatus);
        orderRepository.save(order);
        orderStatusHistoryRepository.save(new OrderStatusHistory(
                order, currentStatus, newOrderStatus, "SYSTEM:" + source, "Shipment status update"));
    }

    private void appendStatusHistory(Shipment shipment, String oldStatus, String newStatus,
                                     String providerStatus, String source, String remarks) {
        ShipmentStatusHistory history = new ShipmentStatusHistory();
        history.setShipment(shipment);
        history.setOldStatus(oldStatus);
        history.setNewStatus(newStatus);
        history.setProviderStatus(providerStatus);
        history.setSource(source);
        history.setRemarks(remarks);
        historyRepository.save(history);
    }

    private ShipmentResponse buildResponse(Order order, Shipment shipment, boolean includeHistory) {
        if (shipment == null) {
            return ShipmentResponse.builder()
                    .orderId(order.getId())
                    .orderNumber(order.getOrderNumber())
                    .build();
        }

        List<ShipmentResponse.StatusHistoryEntry> history = null;
        if (includeHistory) {
            history = historyRepository.findByShipmentIdOrderByReceivedAtAsc(shipment.getId())
                    .stream()
                    .map(h -> ShipmentResponse.StatusHistoryEntry.builder()
                            .oldStatus(h.getOldStatus())
                            .newStatus(h.getNewStatus())
                            .providerStatus(h.getProviderStatus())
                            .source(h.getSource())
                            .eventTime(h.getEventTime())
                            .receivedAt(h.getReceivedAt())
                            .remarks(h.getRemarks())
                            .build())
                    .toList();
        }

        return ShipmentResponse.builder()
                .id(shipment.getId())
                .orderId(order.getId())
                .orderNumber(order.getOrderNumber())
                .shiprocketOrderId(shipment.getShiprocketOrderId())
                .awbCode(shipment.getAwbCode())
                .courierName(shipment.getCourierName())
                .shipmentStatus(shipment.getShipmentStatus())
                .shipmentStatusLabel(statusMapper.getLabel(shipment.getShipmentStatus()))
                .pickupScheduledDate(shipment.getPickupScheduledDate())
                .estimatedDeliveryDate(shipment.getEstimatedDeliveryDate())
                .shippingCharge(shipment.getShippingCharge())
                .lastSyncedAt(shipment.getLastSyncedAt())
                .statusHistory(history)
                .build();
    }

    private User resolveUser(String identifier) {
        return userRepository.findByMobileNumber(identifier)
                .or(() -> userRepository.findByEmail(identifier))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
