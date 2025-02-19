package com.quickfolds.backend.geometry.model.database;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.OffsetDateTime;

/**
 * Represents a point annotated on an origami face during a specific step.
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
     * References the associated origami point.
     */
    @Id
    @Column(name = "point_id", nullable = false, updatable = false)
    private Long pointId;

    /**
     * Foreign key referencing the edge where this point lies, if applicable.
     * Links to a specific edge in the "edge" table.
     */
    @Column(name = "on_edge_id")
    private Long onEdgeId;

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