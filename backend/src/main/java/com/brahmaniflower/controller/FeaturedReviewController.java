package com.brahmaniflower.controller;

import com.brahmaniflower.dto.response.ApiResponse;
import com.brahmaniflower.dto.response.FeaturedReviewResponseDto;
import com.brahmaniflower.repository.ProductReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class FeaturedReviewController {

    private final ProductReviewRepository reviewRepository;

    /** Public — used by the homepage "What Our Customers Say" section. */
    @GetMapping("/featured")
    public ResponseEntity<ApiResponse<List<FeaturedReviewResponseDto>>> getFeaturedReviews() {
        List<FeaturedReviewResponseDto> list = reviewRepository.findFeaturedReviews()
                .stream().map(FeaturedReviewResponseDto::from).toList();
        return ResponseEntity.ok(ApiResponse.success(list));
    }
}
