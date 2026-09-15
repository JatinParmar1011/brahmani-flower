package com.brahmaniflower.service.impl;

import com.brahmaniflower.dto.response.CartResponse;
import com.brahmaniflower.entity.Cart;
import com.brahmaniflower.entity.CartItem;
import com.brahmaniflower.entity.ProductDetail;
import com.brahmaniflower.entity.User;
import com.brahmaniflower.exception.BadRequestException;
import com.brahmaniflower.exception.ResourceNotFoundException;
import com.brahmaniflower.repository.CartItemRepository;
import com.brahmaniflower.repository.CartRepository;
import com.brahmaniflower.repository.ProductDetailRepository;
import com.brahmaniflower.repository.UserRepository;
import com.brahmaniflower.service.CartService;
import jakarta.transaction.Transactional;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@Transactional
public class CartServiceImpl implements CartService {

    private static final int MAX_QUANTITY = 100;

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductDetailRepository productRepository;
    private final UserRepository userRepository;

    public CartServiceImpl(CartRepository cartRepository,
                           CartItemRepository cartItemRepository,
                           ProductDetailRepository productRepository,
                           UserRepository userRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @Override
    public CartResponse getCart(String identifier) {
        Cart cart = cartRepository.findByUserIdentifier(identifier).orElse(null);
        if (cart == null) return emptyCart();
        revalidateStock(cart);
        return toResponse(cart);
    }

    @Override
    public CartResponse addToCart(String identifier, Long productId, int quantity) {
        ProductDetail product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        validateProduct(product, quantity);

        Cart cart = getOrCreateCart(identifier);

        try {
            cartItemRepository.findByCartIdAndProductId(cart.getId(), productId)
                    .ifPresentOrElse(
                            item -> {
                                int newQty = item.getQuantity() + quantity;
                                validateStock(product, newQty);
                                item.setQuantity(newQty);
                            },
                            () -> {
                                CartItem item = new CartItem();
                                item.setCart(cart);
                                item.setProduct(product);
                                item.setQuantity(quantity);
                                cart.getItems().add(item);
                            }
                    );
            return toResponse(cartRepository.save(cart));
        } catch (DataIntegrityViolationException e) {
            CartItem existing = cartItemRepository.findByCartIdAndProductId(cart.getId(), productId)
                    .orElseThrow(() -> new BadRequestException("Failed to add item to cart. Please try again."));
            int newQty = existing.getQuantity() + quantity;
            validateStock(product, newQty);
            existing.setQuantity(newQty);
            return toResponse(cartRepository.save(cart));
        }
    }

    @Override
    public CartResponse updateQuantity(String identifier, Long productId, int quantity) {
        Cart cart = cartRepository.findByUserIdentifier(identifier)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));

        // Pessimistic lock prevents concurrent updates producing incorrect quantities
        CartItem item = cartItemRepository.findByCartIdAndProductIdForUpdate(cart.getId(), productId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not in cart"));

        if (quantity <= 0) {
            cart.getItems().remove(item);
            cartItemRepository.delete(item);
            if (cart.getItems().isEmpty()) {
                cart.setStatus(Cart.CartStatus.ACTIVE);
            }
        } else {
            ProductDetail product = item.getProduct();
            validateStock(product, quantity);
            item.setQuantity(quantity);
        }

        return toResponse(cartRepository.save(cart));
    }

    @Override
    public CartResponse removeFromCart(String identifier, Long productId) {
        Cart cart = cartRepository.findByUserIdentifier(identifier)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));

        CartItem item = cartItemRepository.findByCartIdAndProductId(cart.getId(), productId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not in cart"));

        cart.getItems().remove(item);
        cartItemRepository.delete(item);

        if (cart.getItems().isEmpty()) {
            cart.setStatus(Cart.CartStatus.ACTIVE);
        }

        return toResponse(cartRepository.save(cart));
    }

    @Override
    public void clearCart(String identifier) {
        cartRepository.findByUserIdentifier(identifier).ifPresent(cart -> {
            cart.getItems().clear();
            cart.setStatus(Cart.CartStatus.ACTIVE);
            cartRepository.save(cart);
        });
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    /**
     * Revalidates every item in the cart against current stock and availability.
     * - Unavailable or deleted products are removed.
     * - Quantities exceeding current stock are capped to available stock.
     * - If the cart changes, it is persisted before returning.
     */
    private void revalidateStock(Cart cart) {
        boolean dirty = false;
        List<CartItem> toRemove = new java.util.ArrayList<>();

        for (CartItem item : cart.getItems()) {
            ProductDetail product = item.getProduct();
            if (!Boolean.TRUE.equals(product.getAvailable()) || product.getStock() <= 0) {
                toRemove.add(item);
                dirty = true;
            } else if (item.getQuantity() > product.getStock()) {
                item.setQuantity(product.getStock());
                dirty = true;
            }
        }

        toRemove.forEach(item -> {
            cart.getItems().remove(item);
            cartItemRepository.delete(item);
        });

        if (dirty) {
            if (cart.getItems().isEmpty()) cart.setStatus(Cart.CartStatus.ACTIVE);
            cartRepository.save(cart);
        }
    }

    private void validateProduct(ProductDetail product, int quantity) {
        if (!Boolean.TRUE.equals(product.getAvailable())) {
            throw new BadRequestException("Product \"" + product.getName() + "\" is currently unavailable.");
        }
        validateStock(product, quantity);
    }

    private void validateStock(ProductDetail product, int quantity) {
        if (quantity > MAX_QUANTITY) {
            throw new BadRequestException("Maximum quantity per item is " + MAX_QUANTITY + ".");
        }
        if (product.getStock() <= 0) {
            throw new BadRequestException("Product \"" + product.getName() + "\" is out of stock.");
        }
        if (quantity > product.getStock()) {
            throw new BadRequestException("Only " + product.getStock() + " unit(s) available for \"" + product.getName() + "\".");
        }
    }

    private Cart getOrCreateCart(String identifier) {
        return cartRepository.findByUserIdentifier(identifier).orElseGet(() -> {
            User user = userRepository.findByMobileNumber(identifier)
                    .or(() -> userRepository.findByEmail(identifier))
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            Cart cart = new Cart();
            cart.setUser(user);
            return cartRepository.save(cart);
        });
    }

    private CartResponse toResponse(Cart cart) {
        List<CartResponse.CartItemResponse> itemResponses = cart.getItems().stream()
                .map(item -> {
                    ProductDetail product = item.getProduct();
                    int stock = product.getStock();
                    boolean warning = item.getQuantity() >= stock; // at or near stock limit
                    CartResponse.CartItemResponse r = new CartResponse.CartItemResponse();
                    r.setCartItemId(item.getId());
                    r.setProductId(product.getId());
                    r.setProductName(product.getName());
                    r.setImageUrl(product.getImageUrl());
                    r.setPrice(product.getPrice());
                    r.setOriginalPrice(product.getOriginalPrice());
                    r.setQuantity(item.getQuantity());
                    r.setSubtotal(product.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
                    r.setStockWarning(warning);
                    r.setAvailableStock(stock);
                    return r;
                }).toList();

        BigDecimal total = itemResponses.stream()
                .map(CartResponse.CartItemResponse::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        CartResponse response = new CartResponse();
        response.setCartId(cart.getId());
        response.setItems(itemResponses);
        response.setItemCount(itemResponses.size());
        response.setTotalAmount(total);
        return response;
    }

    private CartResponse emptyCart() {
        CartResponse r = new CartResponse();
        r.setItemCount(0);
        r.setTotalAmount(BigDecimal.ZERO);
        r.setItems(List.of());
        return r;
    }
}
