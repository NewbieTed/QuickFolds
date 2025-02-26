package com.quickfolds.backend.geometry.model.database;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.OffsetDateTime;

/**
 * Represents a point annotated on an origami face during a specific step.
 * <p>
 * This entity stores metadata about the annotated point, including its position
 * within an edge (if applicable) and lifecycle timestamps.
 * <p>
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
     * <p>
     * - References the associated origami point.
     * - Cannot be null and cannot be updated after creation.
     */
    @Id
    @Column(name = "point_id", nullable = false, updatable = false)
    private Long pointId;

    /**
     * Foreign key referencing the edge where this point lies, if applicable.
     * <p>
     * - Links to a specific edge in the "edge" table.
     * - Can be null if the point is not associated with any edge.
     */
    @Column(name = "on_edge_id")
    private Long onEdgeId;

    /**
     * Identifier of the user who created this annotated point record.
     * <p>
     * - Can be null if not explicitly set during creation.
     */
    @Column(name = "created_by")
    private String createdBy;

    /**
     * Identifier of the user who last updated this annotated point record.
     * <p>
     * - Can be null if the record has not been updated.
     */
    @Column(name = "updated_by")
    private String updatedBy;

    /**
     * Timestamp indicating when this annotated point record was created.
     * <p>
     * - Automatically set at the time of creation.
     * - Cannot be updated once the record is created.
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    /**
     * Timestamp indicating when this annotated point record was last updated.
     * <p>
     * - Updated automatically when the record is modified.
     * - Can be null if no updates have occurred.
     */
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}