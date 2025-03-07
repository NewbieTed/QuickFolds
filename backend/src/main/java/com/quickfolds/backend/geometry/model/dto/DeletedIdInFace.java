package com.quickfolds.backend.geometry.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO (Data Transfer Object) representing a deleted ID.
 * <p>
 * This class is used to retrieve information about an ID deleted in an annotate step from the database.
 * This ID can be for either an annotated line or annotated point.
 * It encapsulates data such as the face the point/line is in and its ID in that face.
 * <p>
 * Typical use cases include retrieving deleted IDs from the database.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeletedIdInFace {

    /**
     * The face the deleted annotation is on.
     * <p>
     * This ID serves to identify the face within the origami model.
     */
    private Integer faceIdInOrigami;

    /**
     * The identifier of the deleted annotation within the face.
     * <p>
     * This ID serves to identify the annotation within a specific face.
     */
    private Integer idInFace;
}