package com.quickfolds.backend.geometry.model.database;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.OffsetDateTime;

/**
 * Represents a predefined type of point that can exist on an origami face.
 * <p>
 * This entity maps to the "point_type" table in the database and defines
 * categories of points, such as vertices or annotated points, used in
 * origami folding operations.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "point_type")
public class PointType {

    /**
     * Unique identifier for the point type.
     * <p>
     * - Auto-generated by the database using identity strategy.
     * - Cannot be null and cannot be updated after creation.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false, updatable = false)
    private Long id;

    /**
     * Name of the point type, such as "vertex" or "annotated_point".
     * <p>
     * - Must be unique across all point types.
     * - Cannot be null.
     */
    @Column(name = "point_type_name", nullable = false, unique = true)
    private String pointTypeName;

    /**
     * Identifier of the user who created this point type record.
     * <p>
     * - Can be null if not explicitly set.
     */
    @Column(name = "created_by")
    private String createdBy;

    /**
     * Identifier of the user who last updated this point type record.
     * <p>
     * - Can be null if not explicitly set.
     */
    @Column(name = "updated_by")
    private String updatedBy;

    /**
     * Timestamp when this point type record was created.
     * <p>
     * - Automatically set at the time of creation.
     * - Cannot be updated once created.
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    /**
     * Timestamp when this point type record was last updated.
     * <p>
     * - Updated automatically when the record is modified.
     * - Can be null if no updates have occurred.
     */
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}