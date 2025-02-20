package com.quickfolds.backend.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * Custom exception to handle database inconsistencies or issues across all modules.
 * <p>
 * - Extends `RuntimeException`, allowing it to be thrown without explicit handling.
 * - Used to indicate errors related to database operations, such as:
 *   - Data inconsistency
 *   - Missing or invalid records
 *   - Query execution failures
 * <p>
 * Usage:
 * - Should be thrown in service or repository layers when a database-related error occurs.
 * - Can be caught at a higher level (e.g., in `GlobalExceptionHandler`) to return appropriate responses.
 */
@Getter
@RequiredArgsConstructor
public class DbException extends RuntimeException {
    // Descriptive message explaining the cause of the database error.
    private final String message;
}
