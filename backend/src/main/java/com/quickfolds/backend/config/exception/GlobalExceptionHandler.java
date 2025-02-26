package com.quickfolds.backend.config.exception;

import com.quickfolds.backend.dto.BaseResponse;
import com.quickfolds.backend.exception.DbException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.NoHandlerFoundException;

import java.util.stream.Collectors;

/**
 * Global exception handler for the application.
 * <p>
 * This class provides centralized exception handling across all controllers.
 * It captures and processes common exceptions, returning standardized error responses
 * using the {@link BaseResponse} format.
 * <p>
 * Key functionalities:
 * - Handles validation errors for invalid request bodies.
 * - Manages exceptions related to database operations.
 * - Captures unhandled exceptions and provides meaningful error messages.
 * - Ensures consistent error responses for all API endpoints.
 * <p>
 * This class is annotated with {@code @RestControllerAdvice}, allowing it to intercept
 * exceptions from all controllers and return appropriate responses.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Handles validation errors caused by `@Valid` constraints in request bodies.
     * <p>
     * This method catches {@link MethodArgumentNotValidException}, extracts field-specific error messages,
     * and returns a {@code 400 Bad Request} response with detailed validation feedback.
     *
     * @param ex The exception containing validation errors.
     * @return A {@link BaseResponse} containing the validation error messages.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<BaseResponse<Boolean>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        // Collect all field validation errors and format them into a single string.
        String errors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .collect(Collectors.joining(", "));

        return BaseResponse.failure(
                HttpStatus.BAD_REQUEST.value(),
                errors
        );
    }

    /**
     * Handles requests made to non-existent endpoints.
     * <p>
     * This method catches {@link NoHandlerFoundException}, which occurs when a user
     * requests an invalid endpoint. It returns a {@code 404 Not Found} response.
     *
     * @param ex The exception representing a missing endpoint.
     * @return A {@link BaseResponse} indicating that the endpoint was not found.
     */
    @ExceptionHandler(NoHandlerFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    @ResponseBody
    public ResponseEntity<BaseResponse<Boolean>> handleNotFoundException(NoHandlerFoundException ex) {
        return BaseResponse.failure(HttpStatus.NOT_FOUND.value(), "Endpoint not found");
    }

    /**
     * Handles database-related exceptions.
     * <p>
     * This method catches {@link DbException}, representing data inconsistencies
     * or failures during database operations. It returns a {@code 500 Internal Server Error}.
     *
     * @param ex The {@link DbException} that occurred.
     * @return A {@link BaseResponse} with details about the database error.
     */
    @ExceptionHandler(DbException.class)
    public ResponseEntity<BaseResponse<Boolean>> handleDbException(DbException ex) {
        return BaseResponse.failure(HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "DB inconsistency error: " + ex.getMessage());
    }

    /**
     * Handles invalid arguments passed to methods.
     * <p>
     * This method catches {@link IllegalArgumentException}, which occurs when invalid
     * parameters are passed to a method. It returns a {@code 400 Bad Request}.
     *
     * @param ex The exception representing an invalid argument.
     * @return A {@link BaseResponse} containing the error message.
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<BaseResponse<Boolean>> handleIllegalArgumentException(IllegalArgumentException ex) {
        return BaseResponse.failure(
                HttpStatus.BAD_REQUEST.value(),
                ex.getMessage()
        );
    }

    /**
     * Handles generic exceptions that are not explicitly caught by other handlers.
     * <p>
     * This method catches any exception of type {@link Exception} that is not handled
     * by specific exception handlers, returning a {@code 500 Internal Server Error}.
     *
     * @param ex The exception that occurred.
     * @return A {@link BaseResponse} with a generic error message.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<BaseResponse<Boolean>> handleGenericException(Exception ex) {
        return BaseResponse.failure(HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "An unexpected error occurred: " + ex.getMessage());
    }

    /**
     * Handles critical system errors.
     * <p>
     * This method catches {@link Throwable}, which includes all exceptions and errors,
     * ensuring that critical failures do not expose sensitive information to users.
     * It returns a {@code 500 Internal Server Error}.
     *
     * @param ex The critical error that occurred.
     * @return A {@link BaseResponse} with a generic error message for critical failures.
     */
    @ExceptionHandler(Throwable.class)
    public ResponseEntity<BaseResponse<Boolean>> handleThrowable(Throwable ex) {
        return BaseResponse.failure(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "A critical error occurred: " + ex.getMessage()
        );
    }
}