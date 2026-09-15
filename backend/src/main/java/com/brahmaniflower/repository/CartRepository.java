package com.brahmaniflower.repository;

import com.brahmaniflower.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Long> {

    @Query("SELECT c FROM Cart c WHERE c.user.email = :identifier OR c.user.mobileNumber = :identifier")
    Optional<Cart> findByUserIdentifier(@Param("identifier") String identifier);
}
