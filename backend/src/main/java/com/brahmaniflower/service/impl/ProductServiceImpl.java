package com.brahmaniflower.service.impl;

import com.brahmaniflower.dto.request.ProductRequest;
import com.brahmaniflower.dto.response.ProductResponse;
import com.brahmaniflower.entity.CategoryDetail;
import com.brahmaniflower.entity.ProductCategoryMapping;
import com.brahmaniflower.entity.ProductDetail;
import com.brahmaniflower.exception.ResourceNotFoundException;
import com.brahmaniflower.repository.CategoryRepository;
import com.brahmaniflower.repository.ProductCategoryMappingRepository;
import com.brahmaniflower.repository.ProductDetailRepository;
import com.brahmaniflower.service.ProductService;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductDetailRepository productDetailRepository;
    private final ProductCategoryMappingRepository mappingRepository;
    private final CategoryRepository categoryRepository;
    private final EntityManager entityManager;

    @Override
    public Page<ProductResponse> getAllProducts(Pageable pageable) {
        return productDetailRepository.findByAvailableTrue(pageable).map(this::toResponse);
    }

    @Override
    public Page<ProductResponse> getProductsByCategory(String category, Pageable pageable) {
        return productDetailRepository.findByCategoryNameAndAvailableTrue(category, pageable).map(this::toResponse);
    }

    @Override
    public Page<ProductResponse> getProductsByCategoryName(String categoryName, Pageable pageable) {
        return productDetailRepository.findByCategoryNameAndAvailableTrue(categoryName, pageable).map(this::toResponse);
    }

    @Override
    public Page<ProductResponse> searchProducts(String keyword, Pageable pageable) {
        return productDetailRepository.findByNameContainingIgnoreCaseAndAvailableTrue(keyword, pageable).map(this::toResponse);
    }

    @Override
    public ProductResponse getProductById(Long id) {
        return toResponse(findById(id));
    }

    @Override
    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        ProductDetail product = new ProductDetail();
        mapFields(request, product);
        ProductDetail saved = productDetailRepository.save(product);
        saveCategories(saved, request.getCategoryIds());
        return toResponse(saved);
    }

    @Override
    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        ProductDetail product = findById(id);
        mapFields(request, product);
        ProductDetail saved = productDetailRepository.save(product);
        mappingRepository.deleteByProduct_Id(saved.getId());
        entityManager.flush();
        saveCategories(saved, request.getCategoryIds());
        return toResponse(saved);
    }

    @Override
    @Transactional
    public void deleteProduct(Long id) {
        ProductDetail product = findById(id);
        product.setAvailable(false);
        productDetailRepository.save(product);
    }

    private void mapFields(ProductRequest r, ProductDetail p) {
        p.setName(r.getName());
        p.setDescription(r.getDescription());
        p.setContains(r.getContains());
        p.setPrice(r.getPrice());
        p.setOriginalPrice(r.getOriginalPrice());
        p.setStock(r.getStock());
        p.setRating(r.getRating() != null ? r.getRating() : java.math.BigDecimal.ZERO);
        p.setReviewCount(r.getReviewCount() != null ? r.getReviewCount() : 0);
        p.setTag("None".equals(r.getTag()) ? null : r.getTag());
        p.setImageUrl(r.getImageUrl());
        p.setImageUrl2(r.getImageUrl2());
        p.setImageUrl3(r.getImageUrl3());
        p.setImageUrl4(r.getImageUrl4());
        p.setImageUrl5(r.getImageUrl5());
        p.setDelivery(r.getDelivery() != null ? r.getDelivery() : "Tomorrow");
        p.setHighlight1(r.getHighlight1());
        p.setHighlight2(r.getHighlight2());
        p.setHighlight3(r.getHighlight3());
        p.setHighlight4(r.getHighlight4());
        p.setAvailable(true);
    }

    private void saveCategories(ProductDetail product, List<Long> categoryIds) {
        if (categoryIds == null || categoryIds.isEmpty()) return;
        List<CategoryDetail> cats = categoryRepository.findAllById(categoryIds);
        List<ProductCategoryMapping> mappings = cats.stream()
                .map(c -> new ProductCategoryMapping(product, c))
                .collect(Collectors.toList());
        mappingRepository.saveAll(mappings);
    }

    private ProductDetail findById(Long id) {
        return productDetailRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));
    }

    private ProductResponse toResponse(ProductDetail p) {
        List<Long> categoryIds = mappingRepository.findByProduct_Id(p.getId())
                .stream().map(m -> m.getCategory().getId()).collect(Collectors.toList());

        return ProductResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .description(p.getDescription())
                .contains(p.getContains())
                .price(p.getPrice())
                .originalPrice(p.getOriginalPrice())
                .stock(p.getStock())
                .rating(p.getRating())
                .reviewCount(p.getReviewCount())
                .tag(p.getTag())
                .imageUrl(p.getImageUrl())
                .imageUrl2(p.getImageUrl2())
                .imageUrl3(p.getImageUrl3())
                .imageUrl4(p.getImageUrl4())
                .imageUrl5(p.getImageUrl5())
                .delivery(p.getDelivery())
                .highlight1(p.getHighlight1())
                .highlight2(p.getHighlight2())
                .highlight3(p.getHighlight3())
                .highlight4(p.getHighlight4())
                .available(p.getAvailable())
                .createdAt(p.getCreatedAt())
                .categoryIds(categoryIds)
                .build();
    }
}
