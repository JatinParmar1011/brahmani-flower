package com.brahmaniflower.repository;

import com.brahmaniflower.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    Page<Order> findByUserId(Long userId, Pageable pageable);

    Page<Order> findByStatus(Order.OrderStatus status, Pageable pageable);

    @Query("SELECT o.user.id, COUNT(o), COALESCE(SUM(o.totalAmount), 0) FROM Order o GROUP BY o.user.id")
    List<Object[]> findOrderStatsPerUser();
}
