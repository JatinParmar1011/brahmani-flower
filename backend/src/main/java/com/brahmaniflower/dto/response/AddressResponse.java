package com.brahmaniflower.dto.response;

import com.brahmaniflower.entity.UserAddress;
import java.time.LocalDateTime;

public record AddressResponse(
        Long id,
        String fullName,
        String mobileNumber,
        String address1,
        String address2,
        String city,
        String state,
        String pincode,
        String country,
        String addressType,
        Boolean isDefault,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static AddressResponse from(UserAddress a) {
        return new AddressResponse(
                a.getId(),
                a.getFullName(),
                a.getMobileNumber(),
                a.getAddress1(),
                a.getAddress2(),
                a.getCity(),
                a.getState(),
                a.getPincode(),
                a.getCountry(),
                a.getAddressType(),
                a.getIsDefault(),
                a.getCreatedAt(),
                a.getUpdatedAt()
        );
    }
}
