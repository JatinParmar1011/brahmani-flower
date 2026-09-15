package com.brahmaniflower.service;

import com.brahmaniflower.dto.request.StockAdjustRequest;
import com.brahmaniflower.dto.response.ProductResponse;
import com.brahmaniflower.entity.InventoryTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface InventoryService {
    ProductResponse adjustStock(Long productId, StockAdjustRequest request, String adminIdentifier);
    Page<InventoryTransaction> getTransactions(Long productId, Pageable pageable);
}
