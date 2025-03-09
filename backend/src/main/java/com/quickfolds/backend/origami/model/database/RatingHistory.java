package com.quickfolds.backend.origami.model.database;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

/**
 * Represents a rating given by a user to an origami model.
 * <p>
 * This entity maps to the "rating_history" table in the database and stores
 * information about individual ratings, including the user who rated, the origami
 * being rated, the rating value, and timestamps for record creation and updates.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "rating_history")
public class RatingHistory {

    /**
     * Primary key for the RatingHistory table.
     * <p>
     * This field is auto-generated for each rating record using the IDENTITY strategy,
     * ensuring unique identification of each record.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false, updatable = false)
    private Long id;

    /**
     * Foreign key referencing the user who provided the rating.
     * <p>
     * This field links the rating record to a specific user in the "users" table,
     * ensuring traceability of rating ownership.
     */
    @Column(name = "user_id", nullable = false)
    private Long userId;

    /**
     * Foreign key referencing the origami that was rated.
     * <p>
     * This field links the rating record to a specific origami in the "origami" table.
     */
    @Column(name = "origami_id", nullable = false)
    private Long origamiId;

    /**
     * Rating value given to the origami model.
     * <p>
     * The rating typically ranges from 0.0 to 5.0 and is subject to constraints
     * to prevent invalid values.
     */
    @Column(name = "rating", nullable = false)
    private double rating;

    /**
     * Identifier of the user who created this rating record.
     * <p>
     * This field may be null if the record was created without explicitly specifying the creator.
     */
    @Column(name = "created_by")
    private String createdBy;

    /**
     * Identifier of the user who last updated this rating record.
     * <p>
     * This field may be null if the record has not been updated since its creation.
     */
    @Column(name = "updated_by")
    private String updatedBy;

    /**
     * Timestamp when this rating record was created.
     * <p>
     * This field is automatically set at the time of creation and cannot be updated afterward.
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    /**
     * Timestamp when this rating record was last updated.
     * <p>
     * This field is updated automatically whenever the record is modified.
     */
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}