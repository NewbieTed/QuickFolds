package com.quickfolds.backend.origami.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO (Data Transfer Object) representing a response containing a list of origami models.
 * <p>
 * This class is used to return multiple origami models in API responses.
 * It wraps a list of {@link OrigamiResponse} objects, ensuring a structured and consistent
 * format for clients consuming the API.
 * <p>
 * Typical use cases include:
 * <ul>
 *     <li>Retrieving all public origami models.</li>
 *     <li>Paginating through a collection of origami records.</li>
 * </ul>
 *
 * Dependencies:
 * - {@link OrigamiResponse}: Represents individual origami model details.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrigamiListResponse {

    /**
     * A list of origami models included in the response.
     * <p>
     * Each origami is represented as an {@link OrigamiResponse} object,
     * providing detailed information about the model.
     * <p>
     * This list can be empty if no public origami models are available.
     */
    private List<OrigamiResponse> origamis;
}