package com.brahmaniflower.controller;

import com.brahmaniflower.dto.request.ProductRequest;
import com.brahmaniflower.dto.response.ApiResponse;
import com.brahmaniflower.dto.response.ProductResponse;
import com.brahmaniflower.service.CloudinaryService;
import com.brahmaniflower.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final CloudinaryService cloudinaryService;

    // Public endpoints
    @GetMapping
    public ResponseEntity<ApiResponse<Page<ProductResponse>>> getAllProducts(
            @PageableDefault(size = 12, sort = "createdAt") Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(productService.getAllProducts(pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(productService.getProductById(id)));
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<ApiResponse<Page<ProductResponse>>> getByCategory(
            @PathVariable String category,
            @PageableDefault(size = 50) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(productService.getProductsByCategoryName(category, pageable)));
    }

    @GetMapping("/by-category-name/{categoryName}")
    public ResponseEntity<ApiResponse<Page<ProductResponse>>> getByCategoryName(
            @PathVariable String categoryName,
            @PageableDefault(size = 50) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(productService.getProductsByCategoryName(categoryName, pageable)));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<ProductResponse>>> searchProducts(
            @RequestParam String keyword,
            @PageableDefault(size = 12) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(productService.searchProducts(keyword, pageable)));
    }

    // Admin - Create product with up to 5 images (multipart/form-data)
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(
            @Valid @ModelAttribute ProductRequest request,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) {

        if (images != null && !images.isEmpty()) {
            List<String> urls = cloudinaryService.uploadImages(images);
            if (urls.size() > 0) request.setImageUrl(urls.get(0));
            if (urls.size() > 1) request.setImageUrl2(urls.get(1));
            if (urls.size() > 2) request.setImageUrl3(urls.get(2));
            if (urls.size() > 3) request.setImageUrl4(urls.get(3));
            if (urls.size() > 4) request.setImageUrl5(urls.get(4));
        }

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Product created", productService.createProduct(request)));
    }

    // Admin - Update product with up to 5 images (multipart/form-data)
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ProductResponse>> updateProduct(
            @PathVariable Long id,
            @Valid @ModelAttribute ProductRequest request,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) {

        if (images != null && !images.isEmpty()) {
            List<String> urls = cloudinaryService.uploadImages(images);
            if (urls.size() > 0) request.setImageUrl(urls.get(0));
            if (urls.size() > 1) request.setImageUrl2(urls.get(1));
            if (urls.size() > 2) request.setImageUrl3(urls.get(2));
            if (urls.size() > 3) request.setImageUrl4(urls.get(3));
            if (urls.size() > 4) request.setImageUrl5(urls.get(4));
        }

        return ResponseEntity.ok(ApiResponse.success("Product updated", productService.updateProduct(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success("Product deleted", null));
    }
}
