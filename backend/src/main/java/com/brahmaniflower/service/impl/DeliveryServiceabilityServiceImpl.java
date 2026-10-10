package com.brahmaniflower.service.impl;

import com.brahmaniflower.config.ShiprocketProperties;
import com.brahmaniflower.dto.response.CartServiceabilityResponse;
import com.brahmaniflower.dto.response.ServiceabilityResult;
import com.brahmaniflower.entity.*;
import com.brahmaniflower.exception.BadRequestException;
import com.brahmaniflower.exception.ResourceNotFoundException;
import com.brahmaniflower.repository.*;
import com.brahmaniflower.service.DeliveryServiceabilityService;
import com.brahmaniflower.service.LogisticsProvider;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

/**
 * Central serviceability decision engine.
 *
 * Key design decisions:
 *
 * 1. SINGLE Shiprocket call per cart check — weight is aggregated across all cart items
 *    and one call is made for the whole cart pincode. The result is shared across all
 *    PINCODE_BASED items. CITY_BASED items use only our own application rules.
 *
 * 2. FULL ServiceabilityResult JSON cached in Redis (not just "true"/"false"),
 *    so rate/ETD/courier/COD are all preserved on cache hits.
 *    Cache key includes weight so different cart sizes get correctly priced results.
 *
 * 3. CITY_BASED products without a pincode return SERVICEABLE with a note asking
 *    the customer to confirm their pincode, rather than a silent pass.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DeliveryServiceabilityServiceImpl implements DeliveryServiceabilityService {

    private static final String PINCODE_REGEX    = "^[1-9][0-9]{5}$";
    private static final String CACHE_KEY_PREFIX = "svcb:";
    /** Default per-unit weight in kg used when no product config is found. */
    private static final double DEFAULT_WEIGHT_KG = 0.5;

    private final ProductDetailRepository        productRepository;
    private final ProductDeliveryConfigRepository configRepository;
    private final ProductDeliveryCityRepository   cityMappingRepository;
    private final CartRepository                  cartRepository;
    private final UserAddressRepository           addressRepository;
    private final UserRepository                  userRepository;
    private final LogisticsProvider               logisticsProvider;
    private final ShiprocketProperties            shiprocketProps;
    private final StringRedisTemplate             redisTemplate;
    private final ObjectMapper                    objectMapper;

    // ── Public API ────────────────────────────────────────────────────────────

    @Override
    public ServiceabilityResult checkProductServiceability(
            Long productId, String destinationPincode, String destinationCity) {

        ProductDetail product = productRepository.findById(productId).orElse(null);
        if (product == null) {
            return ServiceabilityResult.builder()
                    .productId(productId)
                    .serviceable(false)
                    .status(ServiceabilityStatus.NOT_SERVICEABLE)
                    .message("Product not found")
                    .build();
        }
        if (!Boolean.TRUE.equals(product.getAvailable())) {
            return ServiceabilityResult.builder()
                    .productId(productId)
                    .serviceable(false)
                    .status(ServiceabilityStatus.NOT_SERVICEABLE)
                    .message("Product is currently unavailable")
                    .build();
        }

        ProductDeliveryConfig config = configRepository.findByProductId(productId).orElse(null);
        DeliveryType deliveryType = (config != null) ? config.getDeliveryType() : DeliveryType.PINCODE_BASED;
        double unitWeight = (config != null && config.getWeightKg() != null)
                ? config.getWeightKg().doubleValue()
                : DEFAULT_WEIGHT_KG;

        if (deliveryType == DeliveryType.CITY_BASED) {
            return checkCityBasedServiceability(product, destinationCity, destinationPincode, unitWeight);
        } else {
            return checkPincodeBasedServiceability(product, destinationPincode, unitWeight);
        }
    }

    /**
     * Checks serviceability for all cart items against an address.
     *
     * FIX (Issue 6): Makes exactly ONE Shiprocket call per cart check, not N.
     * - Aggregates total cart weight from all items and their product configs.
     * - Calls Shiprocket once with the total weight.
     * - Shares the Shiprocket result across all PINCODE_BASED items.
     * - CITY_BASED items are checked against our application's city mapping (no Shiprocket call needed).
     */
    @Override
    public CartServiceabilityResponse checkCartServiceability(String userIdentifier, Long addressId) {
        User user = resolveUser(userIdentifier);
        UserAddress address = addressRepository.findByIdAndUserId(addressId, user.getId())
                .orElseThrow(() -> new BadRequestException("Address not found"));

        Cart cart = cartRepository.findByUserIdentifier(userIdentifier).orElse(null);
        if (cart == null || cart.getItems().isEmpty()) {
            return CartServiceabilityResponse.builder()
                    .allServiceable(true)
                    .serviceableCount(0)
                    .notServiceableCount(0)
                    .items(List.of())
                    .build();
        }

        // ── Step 1: Aggregate total cart weight across all items ──────────────
        double totalWeightKg = 0.0;
        for (CartItem cartItem : cart.getItems()) {
            ProductDeliveryConfig config = configRepository
                    .findByProductId(cartItem.getProduct().getId()).orElse(null);
            double unitWeight = (config != null && config.getWeightKg() != null)
                    ? config.getWeightKg().doubleValue()
                    : DEFAULT_WEIGHT_KG;
            totalWeightKg += unitWeight * cartItem.getQuantity();
        }
        if (totalWeightKg <= 0) totalWeightKg = DEFAULT_WEIGHT_KG;

        // ── Step 2: ONE Shiprocket call for the destination pincode + total weight ──
        ServiceabilityResult pincodeResult = checkShiprocketWithCache(
                address.getPincode(), totalWeightKg);

        // ── Step 3: Apply per-product rules, sharing the Shiprocket result ────
        List<CartServiceabilityResponse.CartItemServiceability> itemResults = new ArrayList<>();
        int serviceableCount    = 0;
        int notServiceableCount = 0;

        for (CartItem cartItem : cart.getItems()) {
            ProductDetail product = cartItem.getProduct();
            ProductDeliveryConfig config = configRepository
                    .findByProductId(product.getId()).orElse(null);
            DeliveryType deliveryType = (config != null)
                    ? config.getDeliveryType()
                    : DeliveryType.PINCODE_BASED;

            ServiceabilityResult itemResult;

            if (deliveryType == DeliveryType.CITY_BASED) {
                // City-based: apply only application rule (city mapping).
                // No new Shiprocket call — the cart-level call already validated the pincode.
                boolean cityAllowed = cityMappingRepository.existsActiveByProductIdAndCityName(
                        product.getId(), address.getCity().trim());

                if (cityAllowed) {
                    // City allowed. Merge Shiprocket result into city-based result.
                    itemResult = pincodeResult.isServiceable()
                            ? ServiceabilityResult.builder()
                                    .productId(product.getId())
                                    .city(address.getCity())
                                    .destinationPincode(address.getPincode())
                                    .serviceable(true)
                                    .status(ServiceabilityStatus.SERVICEABLE)
                                    .message("Delivery available to " + address.getCity())
                                    .deliveryType(DeliveryType.CITY_BASED)
                                    .deliveryCharge(pincodeResult.getDeliveryCharge())
                                    .estimatedDeliveryDate(pincodeResult.getEstimatedDeliveryDate())
                                    .courierName(pincodeResult.getCourierName())
                                    .codAvailable(pincodeResult.isCodAvailable())
                                    .prepaidAvailable(pincodeResult.isPrepaidAvailable())
                                    .build()
                            : ServiceabilityResult.builder()
                                    .productId(product.getId())
                                    .city(address.getCity())
                                    .destinationPincode(address.getPincode())
                                    .serviceable(false)
                                    .status(pincodeResult.getStatus())
                                    .message(pincodeResult.getMessage())
                                    .deliveryType(DeliveryType.CITY_BASED)
                                    .build();
                } else {
                    itemResult = ServiceabilityResult.builder()
                            .productId(product.getId())
                            .city(address.getCity())
                            .serviceable(false)
                            .status(ServiceabilityStatus.NOT_SERVICEABLE)
                            .message("\"" + product.getName() + "\" is not available for delivery to "
                                    + address.getCity())
                            .deliveryType(DeliveryType.CITY_BASED)
                            .build();
                }
            } else {
                // Pincode-based: reuse the single Shiprocket result with product context
                itemResult = ServiceabilityResult.builder()
                        .productId(product.getId())
                        .destinationPincode(address.getPincode())
                        .serviceable(pincodeResult.isServiceable())
                        .status(pincodeResult.getStatus())
                        .message(pincodeResult.getMessage())
                        .deliveryType(DeliveryType.PINCODE_BASED)
                        .deliveryCharge(pincodeResult.getDeliveryCharge())
                        .estimatedDeliveryDate(pincodeResult.getEstimatedDeliveryDate())
                        .courierName(pincodeResult.getCourierName())
                        .codAvailable(pincodeResult.isCodAvailable())
                        .prepaidAvailable(pincodeResult.isPrepaidAvailable())
                        .build();
            }

            CartServiceabilityResponse.CartItemServiceability itemSvc =
                    CartServiceabilityResponse.CartItemServiceability.builder()
                            .cartItemId(cartItem.getId())
                            .productId(product.getId())
                            .productName(product.getName())
                            .serviceable(itemResult.isServiceable())
                            .status(itemResult.getStatus())
                            .message(itemResult.getMessage())
                            .estimatedDeliveryDate(itemResult.getEstimatedDeliveryDate())
                            .build();

            itemResults.add(itemSvc);
            if (itemResult.isServiceable()) serviceableCount++;
            else                            notServiceableCount++;
        }

        return CartServiceabilityResponse.builder()
                .allServiceable(notServiceableCount == 0)
                .serviceableCount(serviceableCount)
                .notServiceableCount(notServiceableCount)
                .totalShippingCharge(pincodeResult.getDeliveryCharge())
                .courierName(pincodeResult.getCourierName())
                .estimatedDeliveryDate(pincodeResult.getEstimatedDeliveryDate())
                .codAvailable(pincodeResult.isCodAvailable())
                .prepaidAvailable(pincodeResult.isPrepaidAvailable())
                .items(itemResults)
                .build();
    }

    @Override
    public void validateCheckoutServiceability(String userIdentifier, Long addressId) {
        CartServiceabilityResponse result = checkCartServiceability(userIdentifier, addressId);
        if (!result.isAllServiceable()) {
            List<String> blocked = result.getItems().stream()
                    .filter(i -> !i.isServiceable())
                    .map(i -> "\"" + i.getProductName() + "\": " + i.getMessage())
                    .toList();
            throw new BadRequestException(
                    "Some items cannot be delivered to the selected address: " +
                    String.join("; ", blocked));
        }
    }

    // ── Private: City-based check ─────────────────────────────────────────────

    private ServiceabilityResult checkCityBasedServiceability(
            ProductDetail product, String destinationCity, String destinationPincode,
            double unitWeight) {

        if (destinationCity == null || destinationCity.isBlank()) {
            return ServiceabilityResult.builder()
                    .productId(product.getId())
                    .serviceable(false)
                    .status(ServiceabilityStatus.LOCATION_REQUIRED)
                    .message("City information is required for this product")
                    .deliveryType(DeliveryType.CITY_BASED)
                    .build();
        }

        boolean cityAllowed = cityMappingRepository.existsActiveByProductIdAndCityName(
                product.getId(), destinationCity.trim());

        if (!cityAllowed) {
            log.info("[Serviceability] CITY_BASED product {} not available in city '{}'",
                    product.getId(), destinationCity);
            return ServiceabilityResult.builder()
                    .productId(product.getId())
                    .city(destinationCity)
                    .serviceable(false)
                    .status(ServiceabilityStatus.NOT_SERVICEABLE)
                    .message("This product is currently not available for delivery to " + destinationCity)
                    .deliveryType(DeliveryType.CITY_BASED)
                    .build();
        }

        // City is allowed by our business rules.
        if (destinationPincode != null && !destinationPincode.isBlank()
                && destinationPincode.matches(PINCODE_REGEX)) {
            // Pincode provided — also confirm Shiprocket can reach it
            ServiceabilityResult shiprocketResult = checkShiprocketWithCache(
                    destinationPincode, unitWeight);
            if (!shiprocketResult.isServiceable()) {
                return ServiceabilityResult.builder()
                        .productId(product.getId())
                        .city(destinationCity)
                        .destinationPincode(destinationPincode)
                        .serviceable(false)
                        .status(shiprocketResult.getStatus())
                        .message(shiprocketResult.getMessage())
                        .deliveryType(DeliveryType.CITY_BASED)
                        .build();
            }
            return ServiceabilityResult.builder()
                    .productId(product.getId())
                    .city(destinationCity)
                    .destinationPincode(destinationPincode)
                    .serviceable(true)
                    .status(ServiceabilityStatus.SERVICEABLE)
                    .message("Delivery available to " + destinationCity)
                    .deliveryType(DeliveryType.CITY_BASED)
                    .deliveryCharge(shiprocketResult.getDeliveryCharge())
                    .estimatedDeliveryDate(shiprocketResult.getEstimatedDeliveryDate())
                    .courierName(shiprocketResult.getCourierName())
                    .codAvailable(shiprocketResult.isCodAvailable())
                    .prepaidAvailable(shiprocketResult.isPrepaidAvailable())
                    .build();
        }

        // FIX (Issue 9): City is in our allowed list but no pincode to verify with Shiprocket.
        // Return SERVICEABLE with a note so the customer knows to confirm their exact pincode.
        return ServiceabilityResult.builder()
                .productId(product.getId())
                .city(destinationCity)
                .serviceable(true)
                .status(ServiceabilityStatus.SERVICEABLE)
                .message("Delivery available to " + destinationCity
                        + ". Enter your pincode to confirm exact availability and get the delivery charge.")
                .deliveryType(DeliveryType.CITY_BASED)
                .build();
    }

    // ── Private: Pincode-based check ─────────────────────────────────────────

    private ServiceabilityResult checkPincodeBasedServiceability(
            ProductDetail product, String destinationPincode, double unitWeight) {

        if (destinationPincode == null || destinationPincode.isBlank()) {
            return ServiceabilityResult.builder()
                    .productId(product.getId())
                    .serviceable(false)
                    .status(ServiceabilityStatus.LOCATION_REQUIRED)
                    .message("Delivery pincode is required")
                    .deliveryType(DeliveryType.PINCODE_BASED)
                    .build();
        }
        if (!destinationPincode.matches(PINCODE_REGEX)) {
            return ServiceabilityResult.builder()
                    .productId(product.getId())
                    .destinationPincode(destinationPincode)
                    .serviceable(false)
                    .status(ServiceabilityStatus.INVALID_PINCODE)
                    .message("Invalid pincode format. Please enter a valid 6-digit pincode.")
                    .deliveryType(DeliveryType.PINCODE_BASED)
                    .build();
        }

        ServiceabilityResult shiprocketResult = checkShiprocketWithCache(
                destinationPincode, unitWeight);

        return ServiceabilityResult.builder()
                .productId(product.getId())
                .destinationPincode(destinationPincode)
                .serviceable(shiprocketResult.isServiceable())
                .status(shiprocketResult.getStatus())
                .message(shiprocketResult.getMessage())
                .deliveryType(DeliveryType.PINCODE_BASED)
                .deliveryCharge(shiprocketResult.getDeliveryCharge())
                .estimatedDeliveryDate(shiprocketResult.getEstimatedDeliveryDate())
                .courierName(shiprocketResult.getCourierName())
                .codAvailable(shiprocketResult.isCodAvailable())
                .prepaidAvailable(shiprocketResult.isPrepaidAvailable())
                .build();
    }

    // ── Private: Shiprocket check with Redis cache ────────────────────────────

    /**
     * FIX (Issue 4): Caches the full ServiceabilityResult JSON in Redis instead of
     * just "true"/"false". This preserves rate, ETD, courier name, and COD availability
     * on cache hits, so customers see accurate shipping charges even for cached pincodes.
     *
     * Cache key includes weight (rounded to 1 decimal) so different cart sizes get
     * correctly priced results when weight affects courier selection.
     */
    private ServiceabilityResult checkShiprocketWithCache(String deliveryPincode,
                                                           double totalWeightKg) {
        String pickupPincode = shiprocketProps.getPickupPincode();
        if (pickupPincode == null || pickupPincode.isBlank()) {
            log.warn("[Serviceability] Pickup pincode not configured in shiprocket.pickup-pincode");
            return ServiceabilityResult.builder()
                    .serviceable(false)
                    .status(ServiceabilityStatus.TEMPORARILY_UNAVAILABLE)
                    .message("Delivery serviceability check is temporarily unavailable")
                    .build();
        }

        // Include weight (1dp) in cache key — different weights may give different rates/couriers
        String weightKey = String.format("%.1f", totalWeightKg);
        String cacheKey  = CACHE_KEY_PREFIX + pickupPincode + ":" + deliveryPincode + ":" + weightKey;

        // ── Check Redis cache (full JSON) ──────────────────────────────────────
        try {
            String cached = redisTemplate.opsForValue().get(cacheKey);
            if (cached != null) {
                log.debug("[Serviceability] Cache hit for pincode={} weight={}kg", deliveryPincode, weightKey);
                try {
                    return objectMapper.readValue(cached, ServiceabilityResult.class);
                } catch (Exception parseEx) {
                    // Corrupted cache entry — continue to fresh call
                    log.warn("[Serviceability] Failed to parse cached result for {}: {}", cacheKey, parseEx.getMessage());
                }
            }
        } catch (Exception e) {
            log.warn("[Serviceability] Redis cache read failed, proceeding without cache: {}", e.getMessage());
        }

        // ── Call Shiprocket ───────────────────────────────────────────────────
        ServiceabilityResult result = logisticsProvider.checkServiceability(
                pickupPincode, deliveryPincode, totalWeightKg);

        // ── Cache only definitive results, never TEMPORARILY_UNAVAILABLE ─────
        if (result.getStatus() == ServiceabilityStatus.SERVICEABLE
                || result.getStatus() == ServiceabilityStatus.NOT_SERVICEABLE) {
            try {
                String json = objectMapper.writeValueAsString(result);
                long ttlMinutes = shiprocketProps.getServiceabilityCacheTtlMinutes();
                redisTemplate.opsForValue().set(cacheKey, json, Duration.ofMinutes(ttlMinutes));
            } catch (Exception e) {
                log.warn("[Serviceability] Redis cache write failed: {}", e.getMessage());
            }
        }

        return result;
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private User resolveUser(String identifier) {
        return userRepository.findByMobileNumber(identifier)
                .or(() -> userRepository.findByEmail(identifier))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
