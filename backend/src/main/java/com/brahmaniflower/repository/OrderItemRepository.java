package com.brahmaniflower.repository;

import com.brahmaniflower.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    /** Find all order items for a given customer and product (with order + address eager-loaded). */
    @Query("SELECT oi FROM OrderItem oi JOIN FETCH oi.order o LEFT JOIN FETCH o.address " +
           "WHERE oi.product.id = :productId " +
           "AND o.user.id = :customerId " +
           "ORDER BY o.createdAt DESC")
    List<OrderItem> findByProductIdAndCustomerId(@Param("productId") Long productId,
                                                 @Param("customerId") Long customerId);

    /** Check if a product appears in a customer's orders. */
    @Query("SELECT COUNT(oi) > 0 FROM OrderItem oi " +
           "WHERE oi.product.id = :productId AND oi.order.user.id = :customerId")
    boolean existsByProductIdAndCustomerId(@Param("productId") Long productId,
                                           @Param("customerId") Long customerId);

    /** Find a specific order item (with order + address eager-loaded) belonging to the customer. */
    @Query("SELECT oi FROM OrderItem oi JOIN FETCH oi.order o LEFT JOIN FETCH o.address " +
           "WHERE oi.id = :orderItemId AND o.user.id = :customerId")
    Optional<OrderItem> findByIdAndCustomerId(@Param("orderItemId") Long orderItemId,
                                              @Param("customerId") Long customerId);
}
