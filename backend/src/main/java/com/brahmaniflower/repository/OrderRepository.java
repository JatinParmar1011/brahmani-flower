package com.brahmaniflower.repository;

import com.brahmaniflower.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    Page<Order> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    Page<Order> findByStatus(Order.OrderStatus status, Pageable pageable);

    Optional<Order> findByIdempotencyKey(String idempotencyKey);

    Optional<Order> findByOrderNumber(String orderNumber);

    @Query("SELECT o.user.id, COUNT(o), COALESCE(SUM(o.totalAmount), 0) FROM Order o GROUP BY o.user.id")
    List<Object[]> findOrderStatsPerUser();

    // Keep backward compat for AdminController
    default Page<Order> findByUserId(Long userId, Pageable pageable) {
        return findByUserIdOrderByCreatedAtDesc(userId, pageable);
    }
}
