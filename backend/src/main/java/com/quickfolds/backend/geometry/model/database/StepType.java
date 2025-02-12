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
 * Represents the type of step in the origami process (e.g., fold, annotate, etc.).
 * Maps to the "step_type" table in the database.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "step_type")
public class StepType {

    /**
     * Primary key for the StepType table.
     * Auto-generated value for each StepType record.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false, updatable = false)
    private Long id;

    /**
     * The name of the step type (e.g., "fold", "annotate").
     * Must be unique across all step types.
     */
    @Column(name = "step_type_name", nullable = false, unique = true)
    private String stepTypeName;

    /**
     * Identifier of the user who created this step type record.
     * May be null if not explicitly set.
     */
    @Column(name = "created_by")
    private String createdBy;

    /**
     * Identifier of the user who last updated this step type record.
     * May be null if not explicitly set.
     */
    @Column(name = "updated_by")
    private String updatedBy;

    /**
     * Timestamp when this step type record was created.
     * Automatically set at the time of creation and not updatable.
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    /**
     * Timestamp when this step type record was last updated.
     * Updated automatically when the record is modified.
     */
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
