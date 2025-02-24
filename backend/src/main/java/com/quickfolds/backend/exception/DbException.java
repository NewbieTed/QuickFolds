package com.quickfolds.backend.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * Custom exception to handle database inconsistencies or issues across all modules.
 * <p>
 * This exception extends {@link RuntimeException}, making it an unchecked exception
 * that can be thrown without explicit handling. It is primarily used to indicate
 * errors related to database operations, such as:
 * <ul>
 *     <li>Data inconsistency</li>
 *     <li>Missing or invalid records</li>
 *     <li>Query execution failures</li>
 * </ul>
 * <p>
 * This exception should be thrown in the service or repository layers when a database-related
 * error occurs. It can be caught at a higher level, such as in the
 * {@link com.quickfolds.backend.config.exception.GlobalExceptionHandler}, to return appropriate
 * API responses.
 */
@Getter
@RequiredArgsConstructor
public class DbException extends RuntimeException {

    /**
     * Descriptive message explaining the cause of the database error.
     * <p>
     * This message provides detailed context about why the exception was thrown,
     * facilitating easier debugging and user-friendly error responses.
     */
    private final String message;
}