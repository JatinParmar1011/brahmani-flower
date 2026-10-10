package com.brahmaniflower.controller;

import com.brahmaniflower.dto.response.ApiResponse;
import com.brahmaniflower.entity.City;
import com.brahmaniflower.entity.DeliveryType;
import com.brahmaniflower.entity.ProductDeliveryCity;
import com.brahmaniflower.entity.ProductDeliveryConfig;
import com.brahmaniflower.exception.BadRequestException;
import com.brahmaniflower.exception.ResourceNotFoundException;
import com.brahmaniflower.repository.CityRepository;
import com.brahmaniflower.repository.ProductDeliveryCityRepository;
import com.brahmaniflower.repository.ProductDeliveryConfigRepository;
import com.brahmaniflower.repository.ProductDetailRepository;
import com.brahmaniflower.util.SecurityUtil;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Admin APIs for delivery configuration management.
 * All endpoints require ADMIN role.
 *
 * Cities: CRUD for city master
 * Product Delivery Type: configure whether a product uses CITY_BASED or PINCODE_BASED delivery
 * Product-City Mapping: map products to allowed delivery cities
 */
@RestController
@RequestMapping("/api/admin/delivery")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminDeliveryController {

    private final CityRepository                 cityRepository;
    private final ProductDeliveryConfigRepository configRepository;
    private final ProductDeliveryCityRepository  cityMappingRepository;
    private final ProductDetailRepository        productRepository;

    // ── City CRUD ─────────────────────────────────────────────────────────────

    @GetMapping("/cities")
    public ResponseEntity<ApiResponse<List<City>>> getAllCities(
            @RequestParam(defaultValue = "ACTIVE") String status) {
        return ResponseEntity.ok(ApiResponse.success(
                cityRepository.findByStatusOrderByCityNameAsc(status)));
    }

    @PostMapping("/cities")
    public ResponseEntity<ApiResponse<City>> createCity(@RequestBody CityRequest request) {
        if (cityRepository.existsByCityNameIgnoreCaseAndStateIgnoreCaseAndCountryIgnoreCase(
                request.getCityName(), request.getState(), request.getCountry())) {
            throw new BadRequestException("City already exists: " + request.getCityName() + ", " + request.getState());
        }
        City city = new City();
        city.setCityName(request.getCityName().trim());
        city.setState(request.getState().trim());
        city.setCountry(request.getCountry() != null ? request.getCountry().trim() : "India");
        city.setStatus("ACTIVE");
        city.setCreatedBy(SecurityUtil.getCurrentUserEmail());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("City created", cityRepository.save(city)));
    }

    @PatchMapping("/cities/{id}/status")
    public ResponseEntity<ApiResponse<City>> updateCityStatus(
            @PathVariable Long id, @RequestParam String status) {
        City city = cityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("City", id));
        city.setStatus(status.toUpperCase());
        city.setUpdatedBy(SecurityUtil.getCurrentUserEmail());
        return ResponseEntity.ok(ApiResponse.success("City status updated", cityRepository.save(city)));
    }

    @DeleteMapping("/cities/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCity(@PathVariable Long id) {
        City city = cityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("City", id));
        city.setStatus("INACTIVE");
        city.setUpdatedBy(SecurityUtil.getCurrentUserEmail());
        cityRepository.save(city);
        return ResponseEntity.ok(ApiResponse.success("City deactivated", null));
    }

    // ── Product Delivery Type ─────────────────────────────────────────────────

    @GetMapping("/products/{productId}/delivery-config")
    public ResponseEntity<ApiResponse<ProductDeliveryConfig>> getDeliveryConfig(
            @PathVariable Long productId) {
        ProductDeliveryConfig config = configRepository.findByProductId(productId)
                .orElseGet(() -> {
                    // Return a default config (not persisted)
                    ProductDeliveryConfig def = new ProductDeliveryConfig();
                    def.setDeliveryType(DeliveryType.PINCODE_BASED);
                    def.setEnabled(true);
                    return def;
                });
        return ResponseEntity.ok(ApiResponse.success(config));
    }

    @PutMapping("/products/{productId}/delivery-config")
    public ResponseEntity<ApiResponse<ProductDeliveryConfig>> setDeliveryConfig(
            @PathVariable Long productId,
            @RequestBody DeliveryConfigRequest request) {

        var product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", productId));

        String actor = SecurityUtil.getCurrentUserEmail();
        ProductDeliveryConfig config = configRepository.findByProductId(productId)
                .orElseGet(() -> {
                    ProductDeliveryConfig newConfig = new ProductDeliveryConfig();
                    newConfig.setProduct(product);
                    newConfig.setCreatedBy(actor);
                    return newConfig;
                });

        config.setDeliveryType(request.getDeliveryType());
        config.setEnabled(request.getEnabled() != null ? request.getEnabled() : true);
        config.setUpdatedBy(actor);

        return ResponseEntity.ok(ApiResponse.success("Delivery config updated",
                configRepository.save(config)));
    }

    // ── Product-City Mapping ─────────────────────────────────────────────────

    @GetMapping("/products/{productId}/cities")
    public ResponseEntity<ApiResponse<List<ProductDeliveryCity>>> getProductCities(
            @PathVariable Long productId) {
        return ResponseEntity.ok(ApiResponse.success(
                cityMappingRepository.findByProductIdAndStatus(productId, "ACTIVE")));
    }

    @PostMapping("/products/{productId}/cities/{cityId}")
    public ResponseEntity<ApiResponse<ProductDeliveryCity>> addCityMapping(
            @PathVariable Long productId, @PathVariable Long cityId) {

        if (cityMappingRepository.existsByProductIdAndCityIdAndStatus(productId, cityId, "ACTIVE")) {
            throw new BadRequestException("Mapping already exists for this product and city");
        }

        var product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", productId));
        var city = cityRepository.findById(cityId)
                .orElseThrow(() -> new ResourceNotFoundException("City", cityId));

        // Check for existing inactive mapping and reactivate
        var existing = cityMappingRepository.findByProductIdAndCityId(productId, cityId);
        if (existing.isPresent()) {
            ProductDeliveryCity mapping = existing.get();
            mapping.setStatus("ACTIVE");
            mapping.setUpdatedBy(SecurityUtil.getCurrentUserEmail());
            return ResponseEntity.ok(ApiResponse.success("City mapping reactivated",
                    cityMappingRepository.save(mapping)));
        }

        String actor = SecurityUtil.getCurrentUserEmail();
        ProductDeliveryCity mapping = new ProductDeliveryCity();
        mapping.setProduct(product);
        mapping.setCity(city);
        mapping.setStatus("ACTIVE");
        mapping.setCreatedBy(actor);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("City mapping added", cityMappingRepository.save(mapping)));
    }

    @DeleteMapping("/products/{productId}/cities/{cityId}")
    public ResponseEntity<ApiResponse<Void>> removeCityMapping(
            @PathVariable Long productId, @PathVariable Long cityId) {

        var mapping = cityMappingRepository.findByProductIdAndCityId(productId, cityId)
                .orElseThrow(() -> new ResourceNotFoundException("City mapping not found"));

        mapping.setStatus("INACTIVE");
        mapping.setUpdatedBy(SecurityUtil.getCurrentUserEmail());
        cityMappingRepository.save(mapping);

        return ResponseEntity.ok(ApiResponse.success("City mapping removed", null));
    }

    // ── Request DTOs ──────────────────────────────────────────────────────────

    @Data
    public static class CityRequest {
        @NotBlank private String cityName;
        @NotBlank private String state;
        private String country = "India";
    }

    @Data
    public static class DeliveryConfigRequest {
        @NotNull private DeliveryType deliveryType;
        private Boolean enabled;
    }
}
