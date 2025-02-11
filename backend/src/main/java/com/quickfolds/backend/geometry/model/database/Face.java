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
 * Represents a face of an origami model, typically created during a specific step in the process.
 * Maps to the "face" table in the database.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "face")
public class Face {

    /**
     * Primary key for the Face table.
     * Auto-generated value for each Face record.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false, updatable = false)
    private Long id;

    /**
     * Foreign key referencing the origami this face belongs to.
     * Links this record to a specific origami in the "origami" table.
     */
    @Column(name = "origami_id", nullable = false)
    private Long origamiId;

    /**
     * Foreign key referencing the step during which this face was created.
     * Links to a specific step in the "step" table.
     */
    @Column(name = "step_id", nullable = false)
    private Long stepId;

    /**
     * A unique identifier for this face within an Origami.
     * Used to differentiate multiple faces belonging to the same Origami.
     */
    @Column(name = "id_in_origami", nullable = false)
    private Integer idInOrigami;

    /**
     * The ID of the step in which this face was deleted, if applicable.
     * Null if the face has not been deleted.
     */
    @Column(name = "deleted_step_id")
    private Long deletedStepId;

    /**
     * Identifier of the user who created this face record.
     * May be null if not explicitly set.
     */
    @Column(name = "created_by")
    private String createdBy;

    /**
     * Identifier of the user who last updated this face record.
     * May be null if not explicitly set.
     */
    @Column(name = "updated_by")
    private String updatedBy;

    /**
     * Timestamp when this face record was created.
     * Automatically set at the time of creation and not updatable.
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    /**
     * Timestamp when this face record was last updated.
     * Updated automatically when the record is modified.
     */
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
