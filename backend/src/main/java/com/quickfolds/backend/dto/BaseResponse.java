package com.quickfolds.backend.dto;

import lombok.Data;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.Instant;

/**
 * A generic response wrapper for API responses.
 * <p>
 * This class provides a standardized structure for API responses, ensuring consistent
 * formatting across all endpoints. It includes fields for status, status code, message,
 * timestamp, and optional response data.
 * <p>
 * Key Features:
 * - Simplifies API responses by enforcing a common structure.
 * - Supports success and failure responses with appropriate status codes.
 * - Automatically includes a timestamp for easier tracking and debugging.
 *
 * @param <T> The type of the data included in the response.
 */
@Data
public class BaseResponse<T> {

    /**
     * Indicates whether the response represents a successful operation.
     * <p>
     * - `true` for success responses.
     * - `false` for failure responses.
     */
    private boolean status;

    /**
     * The HTTP status code associated with the response.
     * <p>
     * Examples:
     * - 200 for OK
     * - 400 for Bad Request
     * - 404 for Not Found
     * - 500 for Internal Server Error
     */
    private int statusCode;

    /**
     * A user-friendly message describing the outcome of the request.
     * <p>
     * This message provides additional context about the result, such as
     * "Operation successful" or "Resource not found."
     */
    private String message;

    /**
     * The actual data being returned in the response.
     * <p>
     * This field holds the result of the operation if successful. It is set to `null`
     * in case of an error or when there is no specific data to return.
     */
    private T data;

    /**
     * The timestamp indicating when the response was created.
     * <p>
     * This value is automatically set to the current time when the response is generated,
     * allowing consumers to trace when the response was produced.
     */
    private Instant timestamp;

    /**
     * Default constructor that initializes the response with the current timestamp.
     */
    public BaseResponse() {
        this.timestamp = Instant.now();
    }

    /**
     * Constructs a `BaseResponse` with specified parameters.
     * <p>
     * This constructor allows full customization of the response, including its status,
     * HTTP code, message, and data.
     *
     * @param status     The success status of the response (true for success, false for failure).
     * @param statusCode The HTTP status code associated with the response.
     * @param message    A descriptive message explaining the result.
     * @param data       The data included in the response, if applicable.
     */
    public BaseResponse(boolean status, int statusCode, String message, T data) {
        this.status = status;
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
        this.timestamp = Instant.now();
    }

    /**
     * Converts this `BaseResponse` into a `ResponseEntity` with the appropriate HTTP status.
     * <p>
     * This method wraps the `BaseResponse` instance in a `ResponseEntity` object,
     * allowing it to be returned directly from controller endpoints.
     *
     * @return A `ResponseEntity` containing this `BaseResponse` object.
     */
    public ResponseEntity<BaseResponse<T>> toResponseEntity() {
        return ResponseEntity.status(this.statusCode).body(this);
    }

    /**
     * Creates a `ResponseEntity` representing a successful response with data.
     * <p>
     * This utility method simplifies the creation of a success response by automatically
     * setting the HTTP status to 200 (OK) and including the provided data.
     *
     * @param data The data to include in the success response.
     * @param <T>  The type of the data being returned.
     * @return A `ResponseEntity` wrapping a success `BaseResponse` object.
     */
    public static <T> ResponseEntity<BaseResponse<T>> success(T data) {
        return ResponseEntity.ok(new BaseResponse<>(true, HttpStatus.OK.value(), "success", data));
    }

    /**
     * Creates a `ResponseEntity` representing a successful response without data.
     * <p>
     * This method generates a success response with a 200 (OK) status and a "success" message,
     * but without any specific data payload.
     *
     * @param <T> The type of the expected response data.
     * @return A `ResponseEntity` wrapping a success `BaseResponse` with null data.
     */
    public static <T> ResponseEntity<BaseResponse<T>> success() {
        return ResponseEntity.ok(new BaseResponse<>(true, HttpStatus.OK.value(), "success", null));
    }

    /**
     * Creates a `ResponseEntity` representing a failure response with a custom status code and message.
     * <p>
     * This method simplifies error handling by generating a standardized error response,
     * including an appropriate HTTP status code and a descriptive error message.
     *
     * @param statusCode The HTTP status code to use for the failure response.
     * @param message    A descriptive message explaining the reason for the failure.
     * @param <T>        The type of the expected response data.
     * @return A `ResponseEntity` wrapping a failure `BaseResponse` with null data.
     */
    public static <T> ResponseEntity<BaseResponse<T>> failure(int statusCode, String message) {
        return ResponseEntity.status(statusCode).body(new BaseResponse<>(false, statusCode, message, null));
    }
}