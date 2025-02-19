package com.quickfolds.backend.origami.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO (Data Transfer Object) representing a response containing a list of origami models.
 *
 * - Used to return multiple origami models in API responses.
 * - Wraps a list of `OrigamiResponse` objects, ensuring a structured response format.
 *
 * Dependencies:
 * - `OrigamiResponse`: Represents individual origami model details.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrigamiListResponse {
    /**
     * A list of origami models included in the response.
     *
     * - Each origami is represented as an `OrigamiResponse` object.
     * - Can be empty if no public origami models are available.
     */
    List<OrigamiResponse> origamis;
}
