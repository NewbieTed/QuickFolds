package com.quickfolds.backend.origami.model.database;

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
 * Represents an origami model created by a user.
 * Maps to the "origami" table in the database.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "origami")
public class Origami {

    /**
     * Primary key for the Origami table.
     * Auto-generated value for each Origami record.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false, updatable = false)
    private Long id;

    /**
     * Foreign key referencing the user who created the origami.
     * Links this record to a specific user in the "users" table.
     */
    @Column(name = "user_id", nullable = false)
    private Long userId;

    /**
     * Indicates whether the origami is public or private.
     * Defaults to false (private).
     */
    @Column(name = "is_public", nullable = false)
    private boolean isPublic;

    /**
     * Average rating for the origami model.
     * The value is between 0.0 and 5.0.
     */
    @Column(name = "ratings", nullable = false)
    private double ratings;

    /**
     * Identifier of the user who created this origami record.
     * May be null if not explicitly set.
     */
    @Column(name = "created_by")
    private String createdBy;

    /**
     * Identifier of the user who last updated this origami record.
     * May be null if not explicitly set.
     */
    @Column(name = "updated_by")
    private String updatedBy;

    /**
     * Timestamp when this origami record was created.
     * Automatically set at the time of creation and not updatable.
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    /**
     * Timestamp when this origami record was last updated.
     * Updated automatically when the record is modified.
     */
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
