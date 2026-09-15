package com.brahmaniflower.controller;

import com.brahmaniflower.dto.request.StockAdjustRequest;
import com.brahmaniflower.dto.response.ApiResponse;
import com.brahmaniflower.dto.response.ProductResponse;
import com.brahmaniflower.entity.InventoryTransaction;
import com.brahmaniflower.service.InventoryService;
import com.brahmaniflower.util.SecurityUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class InventoryController {

    private final InventoryService inventoryService;

    @PostMapping("/{productId}/adjust")
    public ResponseEntity<ApiResponse<ProductResponse>> adjustStock(
            @PathVariable Long productId,
            @Valid @RequestBody StockAdjustRequest request) {
        String admin = SecurityUtil.getCurrentUserEmail();
        ProductResponse updated = inventoryService.adjustStock(productId, request, admin);
        return ResponseEntity.ok(ApiResponse.success("Stock updated", updated));
    }

    @GetMapping("/{productId}/transactions")
    public ResponseEntity<ApiResponse<Page<InventoryTransaction>>> getTransactions(
            @PathVariable Long productId,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(
                inventoryService.getTransactions(productId, pageable)));
    }
}
