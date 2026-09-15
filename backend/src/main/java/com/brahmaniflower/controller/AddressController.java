package com.brahmaniflower.controller;

import com.brahmaniflower.dto.request.AddressRequest;
import com.brahmaniflower.dto.response.AddressResponse;
import com.brahmaniflower.dto.response.ApiResponse;
import com.brahmaniflower.entity.User;
import com.brahmaniflower.entity.UserAddress;
import com.brahmaniflower.exception.ResourceNotFoundException;
import com.brahmaniflower.repository.UserAddressRepository;
import com.brahmaniflower.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user/addresses")
public class AddressController {

    private static final int MAX_ADDRESSES = 5;

    private final UserAddressRepository addressRepository;
    private final UserRepository userRepository;

    public AddressController(UserAddressRepository addressRepository, UserRepository userRepository) {
        this.addressRepository = addressRepository;
        this.userRepository = userRepository;
    }

    // ── GET all addresses ────────────────────────────────────────────────────
    @GetMapping
    public ResponseEntity<ApiResponse<List<AddressResponse>>> getAll(
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = resolveUser(userDetails);
        List<AddressResponse> list = addressRepository
                .findByUserIdOrderByIsDefaultDescCreatedAtDesc(user.getId())
                .stream().map(AddressResponse::from).toList();

        return ResponseEntity.ok(ApiResponse.success(list));
    }

    // ── GET single address ───────────────────────────────────────────────────
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AddressResponse>> getOne(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = resolveUser(userDetails);
        UserAddress address = resolveAddress(id, user.getId());
        return ResponseEntity.ok(ApiResponse.success(AddressResponse.from(address)));
    }

    // ── CREATE address ───────────────────────────────────────────────────────
    @PostMapping
    @Transactional
    public ResponseEntity<ApiResponse<AddressResponse>> create(
            @Valid @RequestBody AddressRequest req,
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = resolveUser(userDetails);

        if (addressRepository.countByUserId(user.getId()) >= MAX_ADDRESSES) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Maximum " + MAX_ADDRESSES + " addresses allowed"));
        }

        boolean makeDefault = Boolean.TRUE.equals(req.getIsDefault())
                || !addressRepository.existsByUserId(user.getId());

        if (makeDefault) {
            addressRepository.clearDefaultByUserId(user.getId());
        }

        UserAddress address = buildAddress(req, user, makeDefault);
        addressRepository.save(address);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Address added successfully", AddressResponse.from(address)));
    }

    // ── UPDATE address ───────────────────────────────────────────────────────
    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<ApiResponse<AddressResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody AddressRequest req,
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = resolveUser(userDetails);
        UserAddress address = resolveAddress(id, user.getId());

        if (Boolean.TRUE.equals(req.getIsDefault()) && !address.getIsDefault()) {
            addressRepository.clearDefaultByUserId(user.getId());
            address.setIsDefault(true);
        }

        applyUpdates(req, address);
        addressRepository.save(address);

        return ResponseEntity.ok(ApiResponse.success("Address updated successfully", AddressResponse.from(address)));
    }

    // ── SET DEFAULT ──────────────────────────────────────────────────────────
    @PatchMapping("/{id}/default")
    @Transactional
    public ResponseEntity<ApiResponse<AddressResponse>> setDefault(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = resolveUser(userDetails);
        UserAddress address = resolveAddress(id, user.getId());

        addressRepository.clearDefaultByUserId(user.getId());
        address.setIsDefault(true);
        addressRepository.save(address);

        return ResponseEntity.ok(ApiResponse.success("Default address updated", AddressResponse.from(address)));
    }

    // ── DELETE address ───────────────────────────────────────────────────────
    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = resolveUser(userDetails);
        UserAddress address = resolveAddress(id, user.getId());
        addressRepository.delete(address);

        // If deleted address was default, promote the most recent remaining address
        if (Boolean.TRUE.equals(address.getIsDefault())) {
            addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(user.getId())
                    .stream().findFirst().ifPresent(a -> {
                        a.setIsDefault(true);
                        addressRepository.save(a);
                    });
        }

        return ResponseEntity.ok(ApiResponse.success("Address deleted successfully", null));
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private User resolveUser(UserDetails userDetails) {
        String identifier = userDetails.getUsername();
        return userRepository.findByMobileNumber(identifier)
                .or(() -> userRepository.findByEmail(identifier))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private UserAddress resolveAddress(Long addressId, Long userId) {
        return addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Address", addressId));
    }

    private UserAddress buildAddress(AddressRequest req, User user, boolean isDefault) {
        UserAddress a = new UserAddress();
        a.setUser(user);
        a.setIsDefault(isDefault);
        applyUpdates(req, a);
        return a;
    }

    private void applyUpdates(AddressRequest req, UserAddress a) {
        a.setFullName(req.getFullName().trim());
        a.setMobileNumber(req.getMobileNumber().trim());
        a.setAddress1(req.getAddress1().trim());
        a.setAddress2(req.getAddress2() != null ? req.getAddress2().trim() : null);
        a.setCity(req.getCity().trim());
        a.setState(req.getState().trim());
        a.setPincode(req.getPincode().trim());
        a.setCountry(req.getCountry() != null && !req.getCountry().isBlank() ? req.getCountry().trim() : "India");
        a.setAddressType(req.getAddressType() != null ? req.getAddressType().toUpperCase() : "HOME");
    }
}
