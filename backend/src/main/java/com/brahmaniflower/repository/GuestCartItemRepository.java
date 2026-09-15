package com.brahmaniflower.repository;

import com.brahmaniflower.entity.GuestCartItem;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface GuestCartItemRepository extends JpaRepository<GuestCartItem, Long> {

    Optional<GuestCartItem> findByGuestCartIdAndProductId(Long guestCartId, Long productId);

    /** Pessimistic write lock — used by updateQuantity to prevent lost updates. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT gci FROM GuestCartItem gci WHERE gci.guestCart.id = :guestCartId AND gci.product.id = :productId")
    Optional<GuestCartItem> findByGuestCartIdAndProductIdForUpdate(
            @Param("guestCartId") Long guestCartId,
            @Param("productId") Long productId);
}
