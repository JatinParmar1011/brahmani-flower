package com.brahmaniflower.repository;

import com.brahmaniflower.entity.GuestCart;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface GuestCartRepository extends JpaRepository<GuestCart, Long> {

    Optional<GuestCart> findBySessionToken(String sessionToken);

    // Used by cleanup scheduler to delete expired carts
    List<GuestCart> findByExpiresAtBefore(LocalDateTime dateTime);
}
