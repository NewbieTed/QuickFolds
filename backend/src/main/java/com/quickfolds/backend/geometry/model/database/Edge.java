package com.quickfolds.backend.geometry.model.database;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.OffsetDateTime;

/**
 * Represents an edge in an origami, including edges on the side and between faces.
 * Maps to the "edge" table in the database.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "edge")
public class Edge {

    /**
     * Unique identifier for the edge.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false, updatable = false)
    private Long id;

    /**
     * Foreign key referencing the step in which this edge was created.
     * Links to a specific step in the "step" table.
     */
    @Column(name = "step_id", nullable = false)
    private Long stepId;

    /**
     * Foreign key referencing the type of edge (e.g., side or fold).
     * Links to a specific edge type in the "edge_type" table.
     */
    @Column(name = "edge_type_id", nullable = false)
    private Long edgeTypeId;

    /**
     * Foreign key referencing the step where this edge was marked as deleted.
     * Null if the edge is still active.
     */
    @Column(name = "deleted_step_id")
    private Long deletedStepId;

    /**
     * Identifier of the user who created this edge record.
     * May be null if not explicitly set.
     */
    @Column(name = "created_by")
    private String createdBy;

    /**
     * Identifier of the user who last updated this edge record.
     * May be null if not explicitly set.
     */
    @Column(name = "updated_by")
    private String updatedBy;

    /**
     * Timestamp when this edge record was created.
     * Automatically set at the time of creation and not updatable.
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    /**
     * Timestamp when this edge record was last updated.
     * Updated automatically when the record is modified.
     */
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}