package com.brahmaniflower.shiprocket;

/**
 * Thrown when an unrecoverable error occurs during Shiprocket API communication.
 * This is a runtime exception to propagate through service layers.
 */
public class ShiprocketException extends RuntimeException {

    public ShiprocketException(String message) {
        super(message);
    }

    public ShiprocketException(String message, Throwable cause) {
        super(message, cause);
    }
}
