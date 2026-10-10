package com.brahmaniflower.shiprocket.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ShiprocketAuthRequest {

    @JsonProperty("email")
    private String email;

    @JsonProperty("password")
    private String password;
}
