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
 * Represents a vertex in a face of an origami model.
 * Stores the position and associations of the vertex in the origami process.
 * Maps to the "vertex" table in the database.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "vertex")
public class Vertex {

    /**
     * Primary key for the Vertex table.
     * Auto-generated value for each Vertex record.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false, updatable = false)
    private Long id;

    /**
     * Foreign key referencing the step where this vertex was created.
     * Links to a specific step in the "step" table.
     */
    @Column(name = "step_id", nullable = false)
    private Long stepId;

    /**
     * Foreign key referencing the face to which this vertex belongs.
     * Links to a specific face in the "face" table.
     */
    @Column(name = "face_id", nullable = false)
    private Long faceId;

    /**
     * X-coordinate of the vertex in the origami face.
     * Represents the horizontal position of the vertex.
     */
    @Column(name = "x_pos", nullable = false)
    private Double xPos;

    /**
     * Y-coordinate of the vertex in the origami face.
     * Represents the vertical position of the vertex.
     */
    @Column(name = "y_pos", nullable = false)
    private Double yPos;

    /**
     * The vertex number within the face.
     * Used to differentiate multiple vertices in the same face.
     */
    @Column(name = "id_in_face", nullable = false)
    private Integer idInFace;

    /**
     * Foreign key referencing the step where this vertex was deleted.
     * Null if the vertex has not been deleted.
     */
    @Column(name = "deleted_step")
    private Long deletedStepId;

    /**
     * Identifier of the user who created this vertex record.
     * May be null if not explicitly set.
     */
    @Column(name = "created_by")
    private String createdBy;

    /**
     * Identifier of the user who last updated this vertex record.
     * May be null if not explicitly set.
     */
    @Column(name = "updated_by")
    private String updatedBy;

    /**
     * Timestamp when this vertex record was created.
     * Automatically set at the time of creation and not updatable.
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    /**
     * Timestamp when this vertex record was last updated.
     * Updated automatically when the record is modified.
     */
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
