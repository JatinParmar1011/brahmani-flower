package com.brahmaniflower.repository;

import com.brahmaniflower.entity.UserAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserAddressRepository extends JpaRepository<UserAddress, Long> {

    List<UserAddress> findByUserIdOrderByIsDefaultDescCreatedAtDesc(Long userId);

    Optional<UserAddress> findByIdAndUserId(Long id, Long userId);

    boolean existsByUserId(Long userId);

    @Modifying
    @Query("UPDATE UserAddress a SET a.isDefault = false WHERE a.user.id = :userId")
    void clearDefaultByUserId(@Param("userId") Long userId);

    long countByUserId(Long userId);
}
