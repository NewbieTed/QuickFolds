package com.quickfolds.backend.origami.model.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO (Data Transfer Object) representing a request to create a new origami model.
 *
 * - Captures the user ID and optional origami name during creation.
 * - Ensures validation constraints for data integrity.
 *
 * Validation:
 * - `userId`: Must not be null and must be non-negative.
 * - `origamiName`: Must not be null.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NewOrigamiRequest {
    /**
     * The ID of the user creating the origami model.
     *
     * - Must be non-null.
     * - Must be zero or positive (no negative values allowed).
     */
    @NotNull(message = "Field 'userId' in New Origami Request must not be null")
    @PositiveOrZero(message = "Field 'userId' in New Origami Request must be non-negative")
    private Long userId;

    /**
     * The name of the origami model.
     *
     * - Must be non-null.
     * - Allows users to provide a meaningful name for their creation.
     */
    @NotNull(message = "Field 'origamiId' in Annotate Request must not be null")
    private String origamiName;
}
