package com.quickfolds.backend.config.exception;

import com.quickfolds.backend.dto.BaseResponse;
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

@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Handle validation errors (e.g., @Valid constraints)
     *
     * @param ex MethodArgumentNotValidException
     * @return BaseResponse with error details
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<BaseResponse<Boolean>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        // Collect all field validation errors and format as a string
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
     * Handle generic exceptions for unexpected errors
     *
     * @param ex Exception
     * @return BaseResponse with error details
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<BaseResponse<Boolean>> handleGenericExceptions(Exception ex) {
        return BaseResponse.failure(
                HttpStatus.BAD_REQUEST.value(),
                ex.getMessage()
        );
    }


    @ExceptionHandler(NoHandlerFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    @ResponseBody
    public ResponseEntity<BaseResponse<Boolean>> handleNotFoundException(NoHandlerFoundException ex) {
        return BaseResponse.failure(HttpStatus.NOT_FOUND.value(), "Endpoint not found");
    }

}
