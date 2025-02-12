package com.quickfolds.backend.dto;

import lombok.Data;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.Instant;

@Data
public class BaseResponse<T> {
    private boolean status;      // success or error
    private int statusCode;     // HTTP status code (e.g., 200, 404)
    private String message;     // A user-friendly message
    private T data;             // The actual data being returned
    private Instant timestamp;  // Timestamp of the response

    // Default constructor
    public BaseResponse() {
        this.timestamp = Instant.now(); // Set the current timestamp
    }

    // Constructor with parameters
    public BaseResponse(boolean status, int statusCode, String message, T data) {
        this.status = status;
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
        this.timestamp = Instant.now(); // Automatically set timestamp
    }

    // ---- NEW METHODS FOR ResponseEntity ---- //

    /**
     * Wrap this BaseResponse in a ResponseEntity with the status code from BaseResponse.
     *
     * @return ResponseEntity wrapping the BaseResponse
     */
    public ResponseEntity<BaseResponse<T>> toResponseEntity() {
        return ResponseEntity.status(this.statusCode).body(this);
    }

    /**
     * Static method to create a success ResponseEntity with data.
     *
     * @param data The success data to include
     * @return ResponseEntity wrapping a success BaseResponse
     */
    public static <T> ResponseEntity<BaseResponse<T>> success(T data) {
        return ResponseEntity.ok(new BaseResponse<>(true, HttpStatus.OK.value(), "", data));
    }


    /**
     * Static method to create a success ResponseEntity with no data.
     *
     * @return ResponseEntity wrapping a success BaseResponse
     */
    public static <T> ResponseEntity<BaseResponse<T>> success() {
        return ResponseEntity.ok(new BaseResponse<>(true, HttpStatus.OK.value(), "", null));
    }

    /**
     * Static method to create a failure ResponseEntity with a status code and message.
     *
     * @param statusCode HTTP status code for the failure
     * @param message    Error message
     * @return ResponseEntity wrapping a failure BaseResponse
     */
    public static <T> ResponseEntity<BaseResponse<T>> failure(int statusCode, String message) {
        return ResponseEntity.status(statusCode).body(new BaseResponse<>(false, statusCode, message, null));
    }
}