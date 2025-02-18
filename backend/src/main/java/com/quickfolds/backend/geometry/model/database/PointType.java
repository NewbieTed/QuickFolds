package com.quickfolds.backend.geometry.model.database;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.OffsetDateTime;

/**
 * Represents a predefined type of point that can exist on an origami face.
 * Maps to the "point_type" table in the database.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "point_type")
public class PointType {

    /**
     * Unique identifier for the point type.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false, updatable = false)
    private Long id;

    /**
     * Name of the point type, such as vertex or annotated_point.
     */
    @Column(name = "point_type_name", nullable = false, unique = true)
    private String pointTypeName;

    /**
     * Identifier of the user who created this point type record.
     * May be null if not explicitly set.
     */
    @Column(name = "created_by")
    private String createdBy;

    /**
     * Identifier of the user who last updated this point type record.
     * May be null if not explicitly set.
     */
    @Column(name = "updated_by")
    private String updatedBy;

    /**
     * Timestamp when this point type record was created.
     * Automatically set at the time of creation and not updatable.
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    /**
     * Timestamp when this point type record was last updated.
     * Updated automatically when the record is modified.
     */
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}