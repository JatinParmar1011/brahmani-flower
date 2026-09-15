package com.brahmaniflower.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "guest_carts")
public class GuestCart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "session_token", nullable = false, unique = true, length = 64)
    private String sessionToken;

    @OneToMany(mappedBy = "guestCart", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<GuestCartItem> items = new ArrayList<>();

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    // TTL: guest carts expire after 30 days of inactivity
    private LocalDateTime expiresAt;

    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.expiresAt = LocalDateTime.now().plusDays(30);
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = LocalDateTime.now();
        this.expiresAt = LocalDateTime.now().plusDays(30); // refresh TTL on activity
    }

    public GuestCart() {}

    public Long getId() { return id; }
    public String getSessionToken() { return sessionToken; }
    public void setSessionToken(String sessionToken) { this.sessionToken = sessionToken; }
    public List<GuestCartItem> getItems() { return items; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public LocalDateTime getExpiresAt() { return expiresAt; }
}
