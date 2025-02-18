package com.quickfolds.backend.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * Custom exception to handle database inconsistencies or issues across all modules.
 */
@Getter
@RequiredArgsConstructor
public class DbException extends RuntimeException {
    private final String message;
}
