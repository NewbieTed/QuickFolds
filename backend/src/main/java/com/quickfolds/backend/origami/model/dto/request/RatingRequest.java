package com.quickfolds.backend.origami.model.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO (Data Transfer Object) representing a request to rate an origami model.
 * <p>
 * This class captures the user ID, the origami ID, and the rating value.
 * It ensures data integrity through validation constraints, preventing invalid or incomplete
 * requests from reaching the business logic layer.
 * <p>
 * Validation:
 * <ul>
 *     <li><strong>userId:</strong> Must not be null and must be positive.</li>
 *     <li><strong>origamiId:</strong> Must not be null and must be positive.</li>
 *     <li><strong>rating:</strong> Must not be null and must be between 0 and 5.</li>
 * </ul>
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RatingRequest {

    /**
     * The ID of the user submitting the rating.
     * <p>
     * This field identifies the user who is providing a rating for an origami model.
     * It ensures that the rating is associated with a valid user account.
     * <p>
     * Validation:
     * <ul>
     *     <li>Must be non-null.</li>
     *     <li>Must be a positive number (greater than zero).</li>
     * </ul>
     */
    @NotNull(message = "Field 'userId' in Rating Request must not be null")
    @Positive(message = "Field 'userId' in Rating Request must be positive")
    private Long userId;

    /**
     * The ID of the origami model being rated.
     * <p>
     * This field identifies the origami model that is receiving a rating.
     * It ensures that the rating is associated with a valid origami entry.
     * <p>
     * Validation:
     * <ul>
     *     <li>Must be non-null.</li>
     *     <li>Must be a positive number (greater than zero).</li>
     * </ul>
     */
    @NotNull(message = "Field 'origamiId' in Rating Request must not be null")
    @Positive(message = "Field 'origamiId' in Rating Request must be positive")
    private Long origamiId;

    /**
     * The rating value for the origami model.
     * <p>
     * This field captures the user's rating for a given origami model.
     * It ensures that the rating falls within a valid range.
     * <p>
     * Validation:
     * <ul>
     *     <li>Must be non-null.</li>
     *     <li>Must be a number between 0 and 5 (inclusive).</li>
     * </ul>
     */
    @NotNull(message = "Field 'rating' in Rating Request must not be null")
    @Min(value = 0, message = "Field 'rating' in Rating Request must be at least 0")
    @Max(value = 5, message = "Field 'rating' in Rating Request must be at most 5")
    private Double rating;
}