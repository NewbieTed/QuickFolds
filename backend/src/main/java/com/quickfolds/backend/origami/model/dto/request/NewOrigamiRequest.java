package com.quickfolds.backend.origami.model.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO (Data Transfer Object) representing a request to create a new origami model.
 * <p>
 * This class captures the user ID and the optional origami name during the creation process.
 * It ensures data integrity through validation constraints, preventing invalid or incomplete
 * requests from reaching the business logic layer.
 * <p>
 * Validation:
 * <ul>
 *     <li><strong>userId:</strong> Must not be null and must be non-negative.</li>
 *     <li><strong>origamiName:</strong> Must not be null.</li>
 * </ul>
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NewOrigamiRequest {

    /**
     * The ID of the user creating the origami model.
     * <p>
     * This field identifies the user associated with the origami creation request.
     * It ensures that the origami is linked to a valid user account.
     * <p>
     * Validation:
     * <ul>
     *     <li>Must be non-null.</li>
     *     <li>Must be zero or positive (no negative values allowed).</li>
     * </ul>
     */
    @NotNull(message = "Field 'userId' in New Origami Request must not be null")
    @PositiveOrZero(message = "Field 'userId' in New Origami Request must be non-negative")
    private Long userId;

    /**
     * The name of the origami model.
     * <p>
     * This field allows users to assign a meaningful name to their origami creation.
     * It is required to ensure that each origami model is properly identified.
     * <p>
     * Validation:
     * <ul>
     *     <li>Must be non-null.</li>
     * </ul>
     */
    @NotNull(message = "Field 'origamiName' in New Origami Request must not be null")
    private String origamiName;
}