package com.quickfolds.backend.geometry.model.database;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.OffsetDateTime;

/**
 * Represents a point in the origami model, belonging to a specific face and step.
 * Maps to the "origami_point" table in the database.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "origami_point")
public class OrigamiPoint {

    /**
     * Unique identifier for the origami point.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false, updatable = false)
    private Long id;

    /**
     * Foreign key referencing the step in which this point was created.
     * Links to a specific step in the "step" table.
     */
    @Column(name = "step_id", nullable = false)
    private Long stepId;

    /**
     * Foreign key referencing the face to which this point belongs.
     * Links to a specific face in the "face" table.
     */
    @Column(name = "face_id", nullable = false)
    private Long faceId;

    /**
     * Foreign key referencing the type of this point (e.g., vertex, annotated_point).
     * Links to a specific point type in the "point_type" table.
     */
    @Column(name = "point_type_id", nullable = false)
    private Long pointTypeId;

    /**
     * X-coordinate of the point.
     */
    @Column(name = "x_pos", nullable = false)
    private Double xPos;

    /**
     * Y-coordinate of the point.
     */
    @Column(name = "y_pos", nullable = false)
    private Double yPos;

    /**
     * Identifies this point within the face.
     * Used to differentiate multiple points within the same face.
     */
    @Column(name = "id_in_face", nullable = false)
    private Integer idInFace;

    /**
     * Foreign key referencing the step where this point was marked as deleted.
     * Null if the point is still active.
     */
    @Column(name = "deleted_step_id")
    private Long deletedStepId;

    /**
     * Identifier of the user who created this point record.
     * May be null if not explicitly set.
     */
    @Column(name = "created_by")
    private String createdBy;

    /**
     * Identifier of the user who last updated this point record.
     * May be null if not explicitly set.
     */
    @Column(name = "updated_by")
    private String updatedBy;

    /**
     * Timestamp when this point record was created.
     * Automatically set at the time of creation and not updatable.
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    /**
     * Timestamp when this point record was last updated.
     * Updated automatically when the record is modified.
     */
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}