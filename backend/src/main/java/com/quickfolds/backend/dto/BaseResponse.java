package com.quickfolds.backend.dto;

import lombok.Data;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.Instant;

/**
 * A generic response wrapper for API responses.
 *
 * - Standardizes API responses with a consistent structure.
 * - Includes success status, HTTP status code, message, timestamp, and data.
 * - Provides utility methods for creating standardized success and failure responses.
 *
 * @param <T> The type of data included in the response.
 */
@Data
public class BaseResponse<T> {
    // Indicates whether the response represents a successful operation (true) or a failure (false).
    private boolean status;

    // The HTTP status code of the response (e.g., 200 for OK, 404 for Not Found, 500 for Internal Server Error).
    private int statusCode;

    // A user-friendly message describing the result of the request.
    private String message;

    // The actual response data being returned, or null in case of errors.
    private T data;

    // The timestamp at which the response was created.
    private Instant timestamp;

    /**
     * Default constructor that initializes the response with the current timestamp.
     */
    public BaseResponse() {
        this.timestamp = Instant.now(); // Set the current timestamp
    }

    /**
     * Constructs a `BaseResponse` with specified parameters.
     *
     * @param status    The success status of the response (true for success, false for failure).
     * @param statusCode The HTTP status code of the response.
     * @param message   A descriptive message for the response.
     * @param data      The data included in the response (can be null).
     */
    public BaseResponse(boolean status, int statusCode, String message, T data) {
        this.status = status;
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
        this.timestamp = Instant.now(); // Automatically set timestamp
    }


    /**
     * Wraps this `BaseResponse` inside a `ResponseEntity` with the appropriate HTTP status code.
     *
     * @return A `ResponseEntity` containing this `BaseResponse`.
     */
    public ResponseEntity<BaseResponse<T>> toResponseEntity() {
        return ResponseEntity.status(this.statusCode).body(this);
    }

    /**
     * Creates a `ResponseEntity` representing a successful response with data.
     *
     * @param data The response data to include.
     * @param <T>  The type of the response data.
     * @return A `ResponseEntity` wrapping a success `BaseResponse`.
     */
    public static <T> ResponseEntity<BaseResponse<T>> success(T data) {
        return ResponseEntity.ok(new BaseResponse<>(true, HttpStatus.OK.value(), "success", data));
    }


    /**
     * Creates a `ResponseEntity` representing a successful response without data.
     *
     * @param <T> The type of the response data.
     * @return A `ResponseEntity` wrapping a success `BaseResponse` with null data.
     */
    public static <T> ResponseEntity<BaseResponse<T>> success() {
        return ResponseEntity.ok(new BaseResponse<>(true, HttpStatus.OK.value(), "success", null));
    }

    /**
     * Creates a `ResponseEntity` representing a failure response with a custom status code and message.
     *
     * @param statusCode The HTTP status code to use for the error response.
     * @param message    A descriptive error message.
     * @param <T>        The type of the response data.
     * @return A `ResponseEntity` wrapping a failure `BaseResponse` with null data.
     */
    public static <T> ResponseEntity<BaseResponse<T>> failure(int statusCode, String message) {
        return ResponseEntity.status(statusCode).body(new BaseResponse<>(false, statusCode, message, null));
    }
}