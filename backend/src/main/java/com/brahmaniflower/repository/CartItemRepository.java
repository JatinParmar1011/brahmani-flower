package com.brahmaniflower.repository;

import com.brahmaniflower.entity.CartItem;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    Optional<CartItem> findByCartIdAndProductId(Long cartId, Long productId);

    /** Pessimistic write lock — used by updateQuantity to prevent lost updates. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT ci FROM CartItem ci WHERE ci.cart.id = :cartId AND ci.product.id = :productId")
    Optional<CartItem> findByCartIdAndProductIdForUpdate(
            @Param("cartId") Long cartId,
            @Param("productId") Long productId);
}
