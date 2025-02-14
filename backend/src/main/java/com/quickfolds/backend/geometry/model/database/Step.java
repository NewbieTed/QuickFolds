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
 * Represents a step in the process of creating an origami model.
 * Maps to the "step" table in the database.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "step")
public class Step {

    /**
     * Primary key for the Step table.
     * Auto-generated value for each Step record.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false, updatable = false)
    private Long id;

    /**
     * Foreign key referencing the origami this step belongs to.
     * Links this record to a specific origami in the "origami" table.
     */
    @Column(name = "origami_id", nullable = false)
    private Long origamiId;

    /**
     * Foreign key referencing the type of step (e.g., fold or annotate).
     * Links to a predefined step type in the "step_type" table.
     */
    @Column(name = "step_type_id", nullable = false)
    private Long stepTypeId;

    /**
     * The step number within the origami sequence.
     * Helps order steps for a given origami model.
     */
    @Column(name = "id_in_origami", nullable = false)
    private int idInOrigami;

    /**
     * Identifier of the user who created this step record.
     * May be null if not explicitly set.
     */
    @Column(name = "created_by")
    private String createdBy;

    /**
     * Identifier of the user who last updated this step record.
     * May be null if not explicitly set.
     */
    @Column(name = "updated_by")
    private String updatedBy;

    /**
     * Timestamp when this step record was created.
     * Automatically set at the time of creation and not updatable.
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    /**
     * Timestamp when this step record was last updated.
     * Updated automatically when the record is modified.
     */
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
