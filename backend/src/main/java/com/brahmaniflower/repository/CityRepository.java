package com.brahmaniflower.repository;

import com.brahmaniflower.entity.City;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CityRepository extends JpaRepository<City, Long> {

    List<City> findByStatusOrderByCityNameAsc(String status);

    Optional<City> findByCityNameIgnoreCaseAndStateIgnoreCase(String cityName, String state);

    boolean existsByCityNameIgnoreCaseAndStateIgnoreCaseAndCountryIgnoreCase(
            String cityName, String state, String country);
}
