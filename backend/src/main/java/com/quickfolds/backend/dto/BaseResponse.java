package com.quickfolds.backend.dto;

import lombok.Data;
import org.springframework.http.HttpStatus;

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

    // Static factory method for success responses with no return data
    public static BaseResponse<Boolean> success() {
        return new BaseResponse<>(true, HttpStatus.OK.value(), "", null);
    }

    // Static factory method for success responses with return data
    public static <T> BaseResponse<T> success(T data) {
        return new BaseResponse<>(true, HttpStatus.OK.value(), "", data);
    }

    // Static factory method for success responses with return message and data
    public static <T> BaseResponse<T> success(String message, T data) {
        return new BaseResponse<>(true,  HttpStatus.OK.value(), message, data);
    }

    // Static factory method for failure responses with status code and message
    public static <T> BaseResponse<T> failure(int statusCode, String message) {
        return new BaseResponse<>(false, statusCode, message, null);
    }
}

