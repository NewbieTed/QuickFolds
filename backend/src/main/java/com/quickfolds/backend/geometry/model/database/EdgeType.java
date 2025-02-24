package com.quickfolds.backend.geometry.model.database;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.OffsetDateTime;

/**
 * Represents a predefined type of edge that can be applied to an origami model.
 * <p>
 * This entity maps to the "edge_type" table in the database and defines edge categories,
 * such as "side" or "fold," used to differentiate edge behaviors in origami folding steps.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "edge_type")
public class EdgeType {

    /**
     * Unique identifier for the edge type.
     * <p>
     * - Auto-generated by the database using identity strategy.
     * - Cannot be null and cannot be updated after creation.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false, updatable = false)
    private Long id;

    /**
     * Name of the edge type, such as "side" or "fold".
     * <p>
     * - Must be unique across all edge types.
     * - Cannot be null.
     */
    @Column(name = "edge_type_name", nullable = false, unique = true)
    private String edgeTypeName;

    /**
     * Identifier of the user who created this edge type record.
     * <p>
     * - Can be null if not explicitly set.
     */
    @Column(name = "created_by")
    private String createdBy;

    /**
     * Identifier of the user who last updated this edge type record.
     * <p>
     * - Can be null if not explicitly set.
     */
    @Column(name = "updated_by")
    private String updatedBy;

    /**
     * Timestamp indicating when this edge type record was created.
     * <p>
     * - Automatically set at creation.
     * - Cannot be updated once created.
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    /**
     * Timestamp indicating when this edge type record was last updated.
     * <p>
     * - Updated automatically when the record is modified.
     * - Can be null if no updates have occurred.
     */
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}