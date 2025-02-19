package com.quickfolds.backend.config.exception;

import com.quickfolds.backend.dto.BaseResponse;
import com.quickfolds.backend.exception.DbException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.NoHandlerFoundException;

import java.util.stream.Collectors;

/**
 * Global exception handler for the application.
 *
 * - Catches and handles common exceptions across all controllers.
 * - Returns a standardized `BaseResponse` with appropriate HTTP status codes.
 * - Provides specific handlers for validation errors, database inconsistencies,
 *   not found errors, and general exceptions.
 *
 * This class uses `@RestControllerAdvice` to apply exception handling globally.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Handles validation errors caused by `@Valid` constraints in request bodies.
     *
     * - Extracts all field errors from `MethodArgumentNotValidException`.
     * - Formats errors into a readable string.
     * - Returns a `400 Bad Request` response with error details.
     *
     * @param ex The exception containing validation errors.
     * @return A `BaseResponse` containing the validation error messages.
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
     *
     * - Catches `NoHandlerFoundException` when an endpoint is not found.
     * - Returns a `404 Not Found` response.
     *
     * @param ex The exception representing a missing endpoint.
     * @return A `BaseResponse` indicating the endpoint was not found.
     */
    @ExceptionHandler(NoHandlerFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    @ResponseBody
    public ResponseEntity<BaseResponse<Boolean>> handleNotFoundException(NoHandlerFoundException ex) {
        return BaseResponse.failure(HttpStatus.NOT_FOUND.value(), "Endpoint not found");
    }

    /**
     * Handles database-related exceptions.
     *
     * - Catches `DbException`, which represents data inconsistencies or failures.
     * - Returns a `500 Internal Server Error` response with the specific error message.
     *
     * @param ex The `DbException` that occurred.
     * @return A `BaseResponse` with database error details.
     */
    @ExceptionHandler(DbException.class)
    public ResponseEntity<BaseResponse<Boolean>> handleDbException(DbException ex) {
        return BaseResponse.failure(HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "DB inconsistency error: " + ex.getMessage());
    }

    /**
     * Handles invalid arguments passed to methods.
     *
     * - Catches `IllegalArgumentException`, which occurs when method arguments are invalid.
     * - Returns a `400 Bad Request` response with the error message.
     *
     * @param ex The exception representing an invalid argument.
     * @return A `BaseResponse` with the error details.
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
     *
     * - Catches `Exception`, which represents unexpected errors in the application.
     * - Returns a `500 Internal Server Error` response with a generic error message.
     *
     * @param ex The exception that occurred.
     * @return A `BaseResponse` with a generic error message.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<BaseResponse<Boolean>> handleGenericException(Exception ex) {
        return BaseResponse.failure(HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "An unexpected error occurred: " + ex.getMessage());
    }

    /**
     * Handles critical system errors.
     *
     * - Catches `Throwable`, which includes all exceptions and errors.
     * - Returns a `500 Internal Server Error` response for critical failures.
     *
     * @param ex The critical error that occurred.
     * @return A `BaseResponse` with an error message.
     */
    @ExceptionHandler(Throwable.class)
    public ResponseEntity<BaseResponse<Boolean>> handleThrowable(Throwable ex) {
        return BaseResponse.failure(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "A critical error occurred: " + ex.getMessage()
        );
    }
}
