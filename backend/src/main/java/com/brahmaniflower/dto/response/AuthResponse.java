package com.brahmaniflower.dto.response;

public class AuthResponse {

    private String accessToken;
    private String tokenType = "Bearer";
    private Long userId;
    private String name;
    private String email;
    private String mobileNumber;
    private String role;
    private boolean newUser;

    public AuthResponse() {}

    public String getAccessToken() { return accessToken; }
    public void setAccessToken(String accessToken) { this.accessToken = accessToken; }

    public String getTokenType() { return tokenType; }
    public void setTokenType(String tokenType) { this.tokenType = tokenType; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getMobileNumber() { return mobileNumber; }
    public void setMobileNumber(String mobileNumber) { this.mobileNumber = mobileNumber; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public boolean isNewUser() { return newUser; }
    public void setNewUser(boolean newUser) { this.newUser = newUser; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final AuthResponse obj = new AuthResponse();

        public Builder accessToken(String val) { obj.accessToken = val; return this; }
        public Builder tokenType(String val) { obj.tokenType = val; return this; }
        public Builder userId(Long val) { obj.userId = val; return this; }
        public Builder name(String val) { obj.name = val; return this; }
        public Builder email(String val) { obj.email = val; return this; }
        public Builder mobileNumber(String val) { obj.mobileNumber = val; return this; }
        public Builder role(String val) { obj.role = val; return this; }
        public Builder newUser(boolean val) { obj.newUser = val; return this; }
        public AuthResponse build() { return obj; }
    }
}
