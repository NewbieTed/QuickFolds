package com.quickfolds.backend.origami.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO (Data Transfer Object) representing the response for an origami model.
 * <p>
 * This class is used to return detailed information about an origami model in API responses.
 * It encapsulates metadata such as the origami's unique identifier, name, author, and ratings.
 * <p>
 * Typical use cases include:
 * <ul>
 *     <li>Retrieving details of a specific origami.</li>
 *     <li>Displaying origami metadata in lists or search results.</li>
 * </ul>
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrigamiResponse {

    /**
     * The unique identifier of the origami model.
     * <p>
     * This ID is assigned by the database upon creation and serves as a primary reference
     * for identifying the origami model across the system.
     */
    private Long origamiId;

    /**
     * The name of the origami model.
     * <p>
     * This name is provided by the user during creation and is commonly displayed
     * in lists, search results, and detail views.
     */
    private String origamiName;

    /**
     * The author or creator of the origami model.
     * <p>
     * This field represents the user who designed or submitted the origami.
     * It is typically used for attribution purposes.
     */
    private String author;

    /**
     * The average rating of the origami model.
     * <p>
     * This value is typically calculated based on user ratings and represents
     * the overall quality or popularity of the origami. It can be {@code null}
     * if no ratings have been submitted.
     */
    private Double ratings;
}