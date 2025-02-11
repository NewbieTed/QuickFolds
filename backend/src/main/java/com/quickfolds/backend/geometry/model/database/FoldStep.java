package com.quickfolds.backend.geometry.model.database;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

/**
 * Represents a specific type of step in the origami process where a fold is performed.
 * Maps to the "fold_step" table in the database.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "fold_step")
public class FoldStep {

    /**
     * Primary key for the FoldStep table.
     * References the associated step's ID in the "step" table.
     */
    @Id
    @Column(name = "step_id", nullable = false, updatable = false)
    private Long stepId;

    /**
     * Foreign key referencing the face used as a reference (anchored face) in the fold.
     * Links to the "face" table.
     */
    @Column(name = "anchored_face_id", nullable = false)
    private Long anchoredFaceId;

    /**
     * Identifier of the user who created this fold step record.
     * May be null if not explicitly set.
     */
    @Column(name = "created_by")
    private String createdBy;

    /**
     * Identifier of the user who last updated this fold step record.
     * May be null if not explicitly set.
     */
    @Column(name = "updated_by")
    private String updatedBy;

    /**
     * Timestamp when this fold step record was created.
     * Automatically set at the time of creation and not updatable.
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    /**
     * Timestamp when this fold step record was last updated.
     * Updated automatically when the record is modified.
     */
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
