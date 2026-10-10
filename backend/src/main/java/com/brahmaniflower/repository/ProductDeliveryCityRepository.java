package com.brahmaniflower.repository;

import com.brahmaniflower.entity.ProductDeliveryCity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductDeliveryCityRepository extends JpaRepository<ProductDeliveryCity, Long> {

    List<ProductDeliveryCity> findByProductIdAndStatus(Long productId, String status);

    Optional<ProductDeliveryCity> findByProductIdAndCityId(Long productId, Long cityId);

    boolean existsByProductIdAndCityIdAndStatus(Long productId, Long cityId, String status);

    /**
     * Check if a city name (case-insensitive) is mapped for this product and active.
     */
    @Query("""
        SELECT COUNT(pdc) > 0
        FROM ProductDeliveryCity pdc
        JOIN pdc.city c
        WHERE pdc.product.id = :productId
          AND LOWER(c.cityName) = LOWER(:cityName)
          AND pdc.status = 'ACTIVE'
          AND c.status = 'ACTIVE'
    """)
    boolean existsActiveByProductIdAndCityName(@Param("productId") Long productId,
                                               @Param("cityName")  String cityName);

    void deleteByProductIdAndCityId(Long productId, Long cityId);
}
