package com.quickfolds.backend.origami.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO (Data Transfer Object) representing the response for an origami model.
 *
 * - Encapsulates origami metadata for API responses.
 * - Used when returning origami details to clients.
 *
 * Fields:
 * - `origamiId`: Unique identifier of the origami model.
 * - `origamiName`: The name of the origami.
 * - `author`: The creator of the origami.
 * - `ratings`: The average rating of the origami.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrigamiResponse {
    /**
     * The unique identifier of the origami model.
     *
     * - Assigned by the database upon creation.
     * - Used to reference the origami in API responses.
     */
    private Long origamiId;

    /**
     * The name of the origami model.
     *
     * - Provided by the user during creation.
     * - Can be displayed in lists or search results.
     */
    private String origamiName;

    /**
     * The author or creator of the origami model.
     *
     * - Represents the user who designed or submitted the origami.
     */
    private String author;

    /**
     * The average rating of the origami model.
     *
     * - Typically calculated from user ratings.
     * - Can be `null` if no ratings have been submitted.
     */
    private Double ratings;
}
