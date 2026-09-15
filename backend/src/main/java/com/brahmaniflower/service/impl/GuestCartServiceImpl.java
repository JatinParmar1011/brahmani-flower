package com.brahmaniflower.service.impl;

import com.brahmaniflower.dto.response.CartResponse;
import com.brahmaniflower.entity.*;
import com.brahmaniflower.exception.BadRequestException;
import com.brahmaniflower.exception.ResourceNotFoundException;
import com.brahmaniflower.repository.*;
import com.brahmaniflower.service.GuestCartService;
import jakarta.transaction.Transactional;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class GuestCartServiceImpl implements GuestCartService {

    private static final int MAX_QUANTITY = 100;

    private final GuestCartRepository guestCartRepository;
    private final GuestCartItemRepository guestCartItemRepository;
    private final ProductDetailRepository productRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;

    public GuestCartServiceImpl(GuestCartRepository guestCartRepository,
                                GuestCartItemRepository guestCartItemRepository,
                                ProductDetailRepository productRepository,
                                CartRepository cartRepository,
                                CartItemRepository cartItemRepository,
                                UserRepository userRepository) {
        this.guestCartRepository = guestCartRepository;
        this.guestCartItemRepository = guestCartItemRepository;
        this.productRepository = productRepository;
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.userRepository = userRepository;
    }

    @Override
    public CartResponse getCart(String sessionToken) {
        return guestCartRepository.findBySessionToken(sessionToken)
                .map(cart -> { revalidateStock(cart); return toResponse(cart); })
                .orElse(emptyCart());
    }

    @Override
    public CartResponse addToCart(String sessionToken, Long productId, int quantity) {
        ProductDetail product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        validateProduct(product, quantity);

        GuestCart cart = getOrCreateCart(sessionToken);

        try {
            guestCartItemRepository.findByGuestCartIdAndProductId(cart.getId(), productId)
                    .ifPresentOrElse(
                            item -> {
                                int newQty = item.getQuantity() + quantity;
                                validateStock(product, newQty);
                                item.setQuantity(newQty);
                            },
                            () -> {
                                GuestCartItem item = new GuestCartItem();
                                item.setGuestCart(cart);
                                item.setProduct(product);
                                item.setQuantity(quantity);
                                cart.getItems().add(item);
                            }
                    );
            return toResponse(guestCartRepository.save(cart));
        } catch (DataIntegrityViolationException e) {
            GuestCartItem existing = guestCartItemRepository
                    .findByGuestCartIdAndProductId(cart.getId(), productId)
                    .orElseThrow(() -> new BadRequestException("Failed to add item. Please try again."));
            int newQty = existing.getQuantity() + quantity;
            validateStock(product, newQty);
            existing.setQuantity(newQty);
            return toResponse(guestCartRepository.save(cart));
        }
    }

    @Override
    public CartResponse updateQuantity(String sessionToken, Long productId, int quantity) {
        GuestCart cart = guestCartRepository.findBySessionToken(sessionToken)
                .orElseThrow(() -> new ResourceNotFoundException("Guest cart not found"));

        // Pessimistic lock prevents concurrent updates producing incorrect quantities
        GuestCartItem item = guestCartItemRepository
                .findByGuestCartIdAndProductIdForUpdate(cart.getId(), productId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not in cart"));

        if (quantity <= 0) {
            cart.getItems().remove(item);
            guestCartItemRepository.delete(item);
        } else {
            validateStock(item.getProduct(), quantity);
            item.setQuantity(quantity);
        }
        return toResponse(guestCartRepository.save(cart));
    }

    @Override
    public CartResponse removeFromCart(String sessionToken, Long productId) {
        GuestCart cart = guestCartRepository.findBySessionToken(sessionToken)
                .orElseThrow(() -> new ResourceNotFoundException("Guest cart not found"));

        GuestCartItem item = guestCartItemRepository
                .findByGuestCartIdAndProductId(cart.getId(), productId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not in cart"));

        cart.getItems().remove(item);
        guestCartItemRepository.delete(item);
        return toResponse(guestCartRepository.save(cart));
    }

    @Override
    public void clearCart(String sessionToken) {
        guestCartRepository.findBySessionToken(sessionToken).ifPresent(cart -> {
            cart.getItems().clear();
            guestCartRepository.save(cart);
        });
    }

    @Override
    public CartResponse mergeIntoUserCart(String sessionToken, String userIdentifier) {
        GuestCart guestCart = (sessionToken == null || sessionToken.equals("__no_guest__"))
                ? null
                : guestCartRepository.findBySessionToken(sessionToken).orElse(null);

        if (guestCart == null || guestCart.getItems().isEmpty()) {
            return getUserCart(userIdentifier);
        }

        Cart userCart = getOrCreateUserCart(userIdentifier);

        for (GuestCartItem guestItem : guestCart.getItems()) {
            ProductDetail product = guestItem.getProduct();
            if (!Boolean.TRUE.equals(product.getAvailable()) || product.getStock() <= 0) continue;

            int requestedQty = guestItem.getQuantity();

            cartItemRepository.findByCartIdAndProductId(userCart.getId(), product.getId())
                    .ifPresentOrElse(
                            existing -> {
                                int combined = existing.getQuantity() + requestedQty;
                                int safeQty = Math.min(combined, Math.min(product.getStock(), MAX_QUANTITY));
                                existing.setQuantity(safeQty);
                            },
                            () -> {
                                int safeQty = Math.min(requestedQty, Math.min(product.getStock(), MAX_QUANTITY));
                                CartItem item = new CartItem();
                                item.setCart(userCart);
                                item.setProduct(product);
                                item.setQuantity(safeQty);
                                userCart.getItems().add(item);
                            }
                    );
        }

        Cart saved = cartRepository.save(userCart);

        // Mark the user cart as MERGED to record that a guest cart was merged into it
        saved.setStatus(Cart.CartStatus.MERGED);
        saved = cartRepository.save(saved);

        // Delete the guest cart after successful merge
        guestCartRepository.delete(guestCart);

        return toUserCartResponse(saved);
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private void revalidateStock(GuestCart cart) {
        boolean dirty = false;
        List<GuestCartItem> toRemove = new java.util.ArrayList<>();

        for (GuestCartItem item : cart.getItems()) {
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
            guestCartItemRepository.delete(item);
        });

        if (dirty) guestCartRepository.save(cart);
    }

    public static String generateSessionToken() {
        return UUID.randomUUID().toString().replace("-", "") +
               UUID.randomUUID().toString().replace("-", "");
    }

    private GuestCart getOrCreateCart(String sessionToken) {
        return guestCartRepository.findBySessionToken(sessionToken).orElseGet(() -> {
            GuestCart cart = new GuestCart();
            cart.setSessionToken(sessionToken);
            return guestCartRepository.save(cart);
        });
    }

    private Cart getOrCreateUserCart(String identifier) {
        return cartRepository.findByUserIdentifier(identifier).orElseGet(() -> {
            User user = userRepository.findByMobileNumber(identifier)
                    .or(() -> userRepository.findByEmail(identifier))
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            Cart cart = new Cart();
            cart.setUser(user);
            return cartRepository.save(cart);
        });
    }

    private CartResponse getUserCart(String identifier) {
        return cartRepository.findByUserIdentifier(identifier)
                .map(this::toUserCartResponse)
                .orElse(emptyCart());
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

    private CartResponse toResponse(GuestCart cart) {
        List<CartResponse.CartItemResponse> itemResponses = cart.getItems().stream()
                .map(item -> {
                    ProductDetail product = item.getProduct();
                    int stock = product.getStock();
                    boolean warning = item.getQuantity() >= stock;
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
        response.setItems(itemResponses);
        response.setItemCount(itemResponses.size());
        response.setTotalAmount(total);
        return response;
    }

    private CartResponse toUserCartResponse(Cart cart) {
        List<CartResponse.CartItemResponse> itemResponses = cart.getItems().stream()
                .map(item -> {
                    ProductDetail product = item.getProduct();
                    int stock = product.getStock();
                    boolean warning = item.getQuantity() >= stock;
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
