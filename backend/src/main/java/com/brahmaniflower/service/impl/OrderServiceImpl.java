package com.brahmaniflower.service.impl;

import com.brahmaniflower.dto.request.CheckoutRequest;
import com.brahmaniflower.dto.request.OrderRequest;
import com.brahmaniflower.dto.response.OrderResponse;
import com.brahmaniflower.entity.*;
import com.brahmaniflower.exception.BadRequestException;
import com.brahmaniflower.exception.ResourceNotFoundException;
import com.brahmaniflower.repository.*;
import com.brahmaniflower.service.DeliveryServiceabilityService;
import com.brahmaniflower.service.OrderService;
import com.brahmaniflower.service.ShipmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderServiceImpl implements OrderService {

    private final OrderRepository                orderRepository;
    private final OrderStatusHistoryRepository   statusHistoryRepository;
    private final InventoryTransactionRepository inventoryTransactionRepository;
    private final UserRepository                 userRepository;
    private final UserAddressRepository          addressRepository;
    private final CartRepository                 cartRepository;
    private final CartItemRepository             cartItemRepository;
    private final ProductDetailRepository        productRepository;
    private final ProductDeliveryConfigRepository deliveryConfigRepository;
    private final DeliveryServiceabilityService  serviceabilityService;
    private final ShipmentService                shipmentService;

    // ── Checkout from cart ────────────────────────────────────────────────────

    @Override
    @Transactional
    public OrderResponse checkout(String userIdentifier, CheckoutRequest request) {
        // 1. Idempotency check
        if (request.getIdempotencyKey() != null && !request.getIdempotencyKey().isBlank()) {
            var existing = orderRepository.findByIdempotencyKey(request.getIdempotencyKey());
            if (existing.isPresent()) {
                log.info("Duplicate checkout for idempotency key: {}", request.getIdempotencyKey());
                return toResponse(existing.get(), true);
            }
        }

        // 2. Resolve user
        User user = resolveUser(userIdentifier);

        // 3. Resolve address — must belong to this user
        UserAddress address = addressRepository.findByIdAndUserId(request.getAddressId(), user.getId())
                .orElseThrow(() -> new BadRequestException("Address not found or does not belong to you"));

        // 4. Load cart
        Cart cart = cartRepository.findByUserIdentifier(userIdentifier)
                .orElseThrow(() -> new BadRequestException("Your cart is empty"));

        if (cart.getItems().isEmpty()) {
            throw new BadRequestException("Your cart is empty");
        }

        // 5. Serviceability validation (re-run at checkout — stale results not trusted)
        serviceabilityService.validateCheckoutServiceability(userIdentifier, request.getAddressId());

        // 6. Build order
        Order order = new Order();
        order.setUser(user);
        order.setAddress(address);
        order.setOrderNumber(generateOrderNumber());
        order.setIdempotencyKey(request.getIdempotencyKey());
        order.setStatus(Order.OrderStatus.CONFIRMED);
        order.setShippingCharge(BigDecimal.ZERO); // updated by ShipmentService after creation

        // Snapshot delivery address (preserved even if address record is later modified)
        snapshotAddress(order, address);

        BigDecimal total = BigDecimal.ZERO;
        List<InventoryTransaction> pendingTxs = new ArrayList<>();

        // Accumulate total shipment weight and take max dimensions across all items
        BigDecimal totalWeightKg  = BigDecimal.ZERO;
        BigDecimal maxLengthCm    = new BigDecimal("10.0");
        BigDecimal maxBreadthCm   = new BigDecimal("10.0");
        BigDecimal maxHeightCm    = new BigDecimal("10.0");

        // 7. Validate each cart item, lock product, deduct stock atomically
        for (CartItem cartItem : cart.getItems()) {
            ProductDetail product = productRepository.findByIdForUpdate(cartItem.getProduct().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", cartItem.getProduct().getId()));

            if (!Boolean.TRUE.equals(product.getAvailable())) {
                throw new BadRequestException("Product \"" + product.getName() + "\" is no longer available");
            }
            int qty = cartItem.getQuantity();
            if (qty <= 0) throw new BadRequestException("Invalid quantity for: " + product.getName());
            if (product.getStock() < qty) {
                throw new BadRequestException("Insufficient stock for \"" + product.getName()
                        + "\". Available: " + product.getStock() + ", Requested: " + qty);
            }

            // Accumulate weight from product delivery config (fallback 0.5 kg/unit)
            ProductDeliveryConfig dc = deliveryConfigRepository.findByProductId(product.getId()).orElse(null);
            BigDecimal unitWeightKg  = (dc != null && dc.getWeightKg()  != null) ? dc.getWeightKg()  : new BigDecimal("0.5");
            BigDecimal unitLengthCm  = (dc != null && dc.getLengthCm()  != null) ? dc.getLengthCm()  : new BigDecimal("10.0");
            BigDecimal unitBreadthCm = (dc != null && dc.getBreadthCm() != null) ? dc.getBreadthCm() : new BigDecimal("10.0");
            BigDecimal unitHeightCm  = (dc != null && dc.getHeightCm()  != null) ? dc.getHeightCm()  : new BigDecimal("10.0");

            totalWeightKg = totalWeightKg.add(unitWeightKg.multiply(BigDecimal.valueOf(qty)));
            if (unitLengthCm.compareTo(maxLengthCm)   > 0) maxLengthCm  = unitLengthCm;
            if (unitBreadthCm.compareTo(maxBreadthCm) > 0) maxBreadthCm = unitBreadthCm;
            if (unitHeightCm.compareTo(maxHeightCm)   > 0) maxHeightCm  = unitHeightCm;

            int stockBefore = product.getStock();
            product.setStock(stockBefore - qty);
            productRepository.save(product);

            InventoryTransaction tx = new InventoryTransaction();
            tx.setProduct(product);
            tx.setTransactionType(InventoryTransaction.TransactionType.SALE);
            tx.setQuantityChange(-qty);
            tx.setStockBefore(stockBefore);
            tx.setStockAfter(product.getStock());
            tx.setReferenceType("ORDER");
            tx.setCreatedBy(userIdentifier);
            pendingTxs.add(tx);

            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setProduct(product);
            item.setProductName(product.getName());
            item.setQuantity(qty);
            item.setUnitPrice(product.getPrice());
            item.setOriginalPrice(product.getOriginalPrice());
            item.setSubtotal(product.getPrice().multiply(BigDecimal.valueOf(qty)));
            order.getItems().add(item);

            total = total.add(item.getSubtotal());
        }

        order.setTotalAmount(total);
        // Snapshot computed shipment weight and dimensions for Shiprocket use
        order.setShipmentWeightKg(totalWeightKg.compareTo(BigDecimal.ZERO) > 0 ? totalWeightKg : new BigDecimal("0.5"));
        order.setShipmentLengthCm(maxLengthCm);
        order.setShipmentBreadthCm(maxBreadthCm);
        order.setShipmentHeightCm(maxHeightCm);
        Order saved = orderRepository.save(order);

        // Set referenceId now that order id is available
        pendingTxs.forEach(tx -> {
            tx.setReferenceId(saved.getId());
            inventoryTransactionRepository.save(tx);
        });

        // 8. Status history
        statusHistoryRepository.save(new OrderStatusHistory(
                saved, null, Order.OrderStatus.CONFIRMED, userIdentifier, "Order placed"));

        // 9. Clear cart
        cart.getItems().clear();
        cart.setStatus(Cart.CartStatus.CONVERTED);
        cartRepository.save(cart);

        log.info("Order {} created for user {} — total ₹{}", saved.getOrderNumber(), userIdentifier, total);

        // 10. Asynchronously create Shiprocket shipment
        // NOTE: Shipment creation happens OUTSIDE the main transaction to avoid keeping
        // the DB transaction open while waiting on external API calls.
        // This is handled by a @Transactional-annotated method in ShipmentService.
        try {
            shipmentService.createShipmentForOrder(saved);
        } catch (Exception e) {
            // Shipment creation failure does NOT roll back the order
            // The ShipmentStatusSyncJob will retry pending shipments
            log.error("Shipment creation failed for order {} (will be retried): {}",
                    saved.getOrderNumber(), e.getMessage());
        }

        return toResponse(saved, true);
    }

    // ── Queries ───────────────────────────────────────────────────────────────

    @Override
    public Page<OrderResponse> getUserOrders(String userIdentifier, Pageable pageable) {
        User user = resolveUser(userIdentifier);
        return orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), pageable)
                .map(o -> toResponse(o, false));
    }

    @Override
    public OrderResponse getOrderById(Long id, String userIdentifier) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", id));
        User user = resolveUser(userIdentifier);
        if (!order.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Access denied to this order");
        }
        return toResponse(order, true);
    }

    @Override
    public OrderResponse getOrderByIdForAdmin(Long id) {
        return toResponse(orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", id)), true);
    }

    @Override
    public Page<OrderResponse> getAllOrders(Pageable pageable) {
        return orderRepository.findAll(pageable).map(o -> toResponse(o, false));
    }

    @Override
    public Page<OrderResponse> getAllOrders(String status, Pageable pageable) {
        if (status == null || status.isBlank() || status.equalsIgnoreCase("All")) {
            return orderRepository.findAll(pageable).map(o -> toResponse(o, false));
        }
        Order.OrderStatus parsed;
        try {
            parsed = Order.OrderStatus.valueOf(status.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return orderRepository.findAll(pageable).map(o -> toResponse(o, false));
        }
        return orderRepository.findByStatus(parsed, pageable).map(o -> toResponse(o, false));
    }

    @Override
    public List<OrderResponse.StatusHistoryResponse> getStatusHistory(Long orderId, String userIdentifier) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));
        if (!order.getUser().getId().equals(resolveUser(userIdentifier).getId())) {
            throw new BadRequestException("Access denied");
        }
        return statusHistoryRepository.findByOrderIdOrderByCreatedAtAsc(orderId)
                .stream().map(this::toHistoryResponse).toList();
    }

    // ── Status update (admin) ─────────────────────────────────────────────────

    @Override
    @Transactional
    public OrderResponse updateOrderStatus(Long id, String status, String reason, String changedBy) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", id));

        Order.OrderStatus newStatus;
        try {
            newStatus = Order.OrderStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid status: " + status);
        }

        if (!Order.isValidTransition(order.getStatus(), newStatus)) {
            throw new BadRequestException("Invalid status transition: "
                    + order.getStatus() + " → " + newStatus);
        }

        Order.OrderStatus oldStatus = order.getStatus();

        if (newStatus == Order.OrderStatus.CANCELLED) {
            restoreStockOnCancellation(order, changedBy);
        }

        order.setStatus(newStatus);
        Order saved = orderRepository.save(order);
        statusHistoryRepository.save(new OrderStatusHistory(saved, oldStatus, newStatus, changedBy, reason));

        return toResponse(saved, true);
    }

    // ── Legacy placeOrder ─────────────────────────────────────────────────────

    @Override
    @Deprecated
    @Transactional
    public OrderResponse placeOrder(String userEmail, OrderRequest request) {
        User user = resolveUser(userEmail);
        UserAddress address = addressRepository
                .findByUserIdOrderByIsDefaultDescCreatedAtDesc(user.getId())
                .stream().findFirst()
                .orElseThrow(() -> new BadRequestException("No address found. Please add a delivery address."));
        CheckoutRequest cr = new CheckoutRequest();
        cr.setAddressId(address.getId());
        return checkout(userEmail, cr);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void snapshotAddress(Order order, UserAddress address) {
        order.setSnapFullName(address.getFullName());
        order.setSnapMobile(address.getMobileNumber());
        order.setSnapAddress1(address.getAddress1());
        order.setSnapAddress2(address.getAddress2());
        order.setSnapCity(address.getCity());
        order.setSnapState(address.getState());
        order.setSnapPincode(address.getPincode());
        order.setSnapCountry(address.getCountry());
    }

    private void restoreStockOnCancellation(Order order, String changedBy) {
        for (OrderItem item : order.getItems()) {
            ProductDetail product = productRepository.findByIdForUpdate(item.getProduct().getId()).orElse(null);
            if (product == null) continue;
            int stockBefore = product.getStock();
            product.setStock(stockBefore + item.getQuantity());
            productRepository.save(product);

            InventoryTransaction tx = new InventoryTransaction();
            tx.setProduct(product);
            tx.setTransactionType(InventoryTransaction.TransactionType.CANCELLATION);
            tx.setQuantityChange(item.getQuantity());
            tx.setStockBefore(stockBefore);
            tx.setStockAfter(product.getStock());
            tx.setReferenceId(order.getId());
            tx.setReferenceType("ORDER");
            tx.setCreatedBy(changedBy);
            inventoryTransactionRepository.save(tx);
        }
    }

    private User resolveUser(String identifier) {
        return userRepository.findByMobileNumber(identifier)
                .or(() -> userRepository.findByEmail(identifier))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyMMdd");

    private String generateOrderNumber() {
        String datePart = LocalDateTime.now().format(DATE_FMT);
        String seq = String.format("%05d", System.currentTimeMillis() % 100000);
        return "BF" + datePart + seq;
    }

    private OrderResponse toResponse(Order order, boolean includeHistory) {
        List<OrderResponse.OrderItemResponse> items = order.getItems().stream()
                .map(item -> OrderResponse.OrderItemResponse.builder()
                        .productId(item.getProduct().getId())
                        .productName(item.getProductName())
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .originalPrice(item.getOriginalPrice())
                        .subtotal(item.getSubtotal())
                        .build())
                .toList();

        // Prefer snapshot address for historical accuracy
        OrderResponse.AddressInfo addrInfo = null;
        if (order.getSnapAddress1() != null) {
            addrInfo = new OrderResponse.AddressInfo();
            addrInfo.setId(order.getAddress() != null ? order.getAddress().getId() : null);
            addrInfo.setFullName(order.getSnapFullName());
            addrInfo.setMobileNumber(order.getSnapMobile());
            addrInfo.setAddress1(order.getSnapAddress1());
            addrInfo.setAddress2(order.getSnapAddress2());
            addrInfo.setCity(order.getSnapCity());
            addrInfo.setState(order.getSnapState());
            addrInfo.setPincode(order.getSnapPincode());
            addrInfo.setCountry(order.getSnapCountry());
        } else if (order.getAddress() != null) {
            UserAddress a = order.getAddress();
            addrInfo = new OrderResponse.AddressInfo();
            addrInfo.setId(a.getId());
            addrInfo.setFullName(a.getFullName());
            addrInfo.setMobileNumber(a.getMobileNumber());
            addrInfo.setAddress1(a.getAddress1());
            addrInfo.setAddress2(a.getAddress2());
            addrInfo.setCity(a.getCity());
            addrInfo.setState(a.getState());
            addrInfo.setPincode(a.getPincode());
            addrInfo.setCountry(a.getCountry());
            addrInfo.setAddressType(a.getAddressType());
        }

        List<OrderResponse.StatusHistoryResponse> history = includeHistory
                ? statusHistoryRepository.findByOrderIdOrderByCreatedAtAsc(order.getId())
                        .stream().map(this::toHistoryResponse).toList()
                : null;

        return OrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .userId(order.getUser().getId())
                .userName(order.getUser().getName())
                .items(items)
                .totalAmount(order.getTotalAmount())
                .shippingCharge(order.getShippingCharge())
                .status(order.getStatus().name())
                .createdAt(order.getCreatedAt())
                .address(addrInfo)
                .statusHistory(history)
                .build();
    }

    private OrderResponse.StatusHistoryResponse toHistoryResponse(OrderStatusHistory h) {
        OrderResponse.StatusHistoryResponse r = new OrderResponse.StatusHistoryResponse();
        r.setFromStatus(h.getFromStatus() != null ? h.getFromStatus().name() : null);
        r.setToStatus(h.getToStatus().name());
        r.setChangedBy(h.getChangedBy());
        r.setReason(h.getReason());
        r.setCreatedAt(h.getCreatedAt());
        return r;
    }
}
