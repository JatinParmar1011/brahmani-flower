package com.brahmaniflower.service.impl;

import com.brahmaniflower.dto.request.StockAdjustRequest;
import com.brahmaniflower.dto.response.ProductResponse;
import com.brahmaniflower.entity.InventoryTransaction;
import com.brahmaniflower.entity.ProductDetail;
import com.brahmaniflower.exception.BadRequestException;
import com.brahmaniflower.exception.ResourceNotFoundException;
import com.brahmaniflower.repository.InventoryTransactionRepository;
import com.brahmaniflower.repository.ProductDetailRepository;
import com.brahmaniflower.service.InventoryService;
import com.brahmaniflower.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class InventoryServiceImpl implements InventoryService {

    private final ProductDetailRepository productRepository;
    private final InventoryTransactionRepository transactionRepository;
    private final ProductService productService;

    @Override
    @Transactional
    public ProductResponse adjustStock(Long productId, StockAdjustRequest request, String adminIdentifier) {
        if (request.getQuantity() == null || request.getQuantity() == 0) {
            throw new BadRequestException("Quantity must be non-zero");
        }

        InventoryTransaction.TransactionType type;
        try {
            type = InventoryTransaction.TransactionType.valueOf(request.getTransactionType().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid transaction type: " + request.getTransactionType());
        }

        // Pessimistic lock to prevent concurrent adjustments
        ProductDetail product = productRepository.findByIdForUpdate(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", productId));

        int stockBefore = product.getStock();
        int delta = resolveStockDelta(type, request.getQuantity());
        int stockAfter = stockBefore + delta;

        if (stockAfter < 0) {
            throw new BadRequestException("Stock cannot go below zero. Current stock: " + stockBefore);
        }

        product.setStock(stockAfter);
        productRepository.save(product);

        InventoryTransaction tx = new InventoryTransaction();
        tx.setProduct(product);
        tx.setTransactionType(type);
        tx.setQuantityChange(delta);
        tx.setStockBefore(stockBefore);
        tx.setStockAfter(stockAfter);
        tx.setNotes(request.getNotes());
        tx.setCreatedBy(adminIdentifier);
        transactionRepository.save(tx);

        return productService.getProductById(productId);
    }

    @Override
    public Page<InventoryTransaction> getTransactions(Long productId, Pageable pageable) {
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Product", productId);
        }
        return transactionRepository.findByProductIdOrderByCreatedAtDesc(productId, pageable);
    }

    /**
     * Determines the signed stock delta based on transaction type.
     * RESTOCK / RETURN → positive; SALE / DAMAGE / CANCELLATION → negative; ADJUSTMENT → signed by caller.
     */
    private int resolveStockDelta(InventoryTransaction.TransactionType type, int quantity) {
        return switch (type) {
            case RESTOCK, RETURN -> Math.abs(quantity);
            case SALE, DAMAGE    -> -Math.abs(quantity);
            case CANCELLATION    -> Math.abs(quantity);   // cancellation restores stock
            case ADJUSTMENT      -> quantity;              // caller provides signed value
        };
    }
}
