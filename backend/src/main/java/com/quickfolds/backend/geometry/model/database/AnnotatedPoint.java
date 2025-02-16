package com.quickfolds.backend.geometry.model.database;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

/**
 * Represents a point annotated on a face of an origami model during a specific step.
 * Stores the coordinates and associations of the point within the origami process.
 * Maps to the "annotated_point" table in the database.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "annotated_point")
public class AnnotatedPoint {

    /**
     * Primary key for the AnnotatedPoint table.
     * Auto-generated value for each AnnotatedPoint record.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false, updatable = false)
    private Long id;

    /**
     * Foreign key referencing the step where this point was annotated.
     * Links to a specific step in the "step" table.
     */
    @Column(name = "step_id", nullable = false)
    private Long stepId;

    /**
     * Foreign key referencing the face to which this annotated point belongs.
     * Links to a specific face in the "face" table.
     */
    @Column(name = "face_id", nullable = false)
    private Long faceId;

    /**
     * X-coordinate of the annotated point on the face.
     * Represents the horizontal position of the point.
     */
    @Column(name = "x_pos", nullable = false)
    private Double xPos;

    /**
     * Y-coordinate of the annotated point on the face.
     * Represents the vertical position of the point.
     */
    @Column(name = "y_pos", nullable = false)
    private Double yPos;

    /**
     * Foreign key referencing the edge on which this point lies, if applicable.
     * Links to a specific edge in the "edge" table.
     */
    @Column(name = "on_edge_id", nullable = false)
    private Long onEdgeId;

    /**
     * Foreign key referencing the vertex associated with this point, if applicable.
     * Links to a specific vertex in the "vertex" table.
     */
    @Column(name = "vertex_id", nullable = false)
    private Long vertexId;

    /**
     * The point number within the face.
     * Used to differentiate multiple annotated points in the same face.
     */
    @Column(name = "id_in_face", nullable = false)
    private Integer idInFace;

    /**
     * Foreign key referencing the step where this annotated point was deleted.
     * Null if the point has not been deleted.
     */
    @Column(name = "deleted_step_id")
    private Long deletedStepId;

    /**
     * Identifier of the user who created this annotated point record.
     * May be null if not explicitly set.
     */
    @Column(name = "created_by")
    private String createdBy;

    /**
     * Identifier of the user who last updated this annotated point record.
     * May be null if not explicitly set.
     */
    @Column(name = "updated_by")
    private String updatedBy;

    /**
     * Timestamp when this annotated point record was created.
     * Automatically set at the time of creation and not updatable.
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    /**
     * Timestamp when this annotated point record was last updated.
     * Updated automatically when the record is modified.
     */
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
