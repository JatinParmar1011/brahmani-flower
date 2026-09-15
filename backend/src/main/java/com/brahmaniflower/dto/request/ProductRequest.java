package com.brahmaniflower.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ProductRequest {

    @NotBlank(message = "Product name is required")
    private String name;

    private String description;
    private String contains;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    private BigDecimal price;

    @NotNull(message = "Original price is required")
    @DecimalMin(value = "0.01")
    private BigDecimal originalPrice;

    @NotNull(message = "Stock is required")
    @Min(value = 0, message = "Stock cannot be negative")
    private Integer stock;

    private BigDecimal rating;
    private Integer reviewCount;
    private String tag;

    private String imageUrl;
    private String imageUrl2;
    private String imageUrl3;
    private String imageUrl4;
    private String imageUrl5;

    private String delivery;
    private String highlight1;
    private String highlight2;
    private String highlight3;
    private String highlight4;

    private List<Long> categoryIds;
}
