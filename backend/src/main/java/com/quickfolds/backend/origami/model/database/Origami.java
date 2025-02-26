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
 * <p>
 * This entity maps to the "origami" table in the database and stores information
 * about each origami model, including its creator, name, visibility, and ratings.
 * It also tracks timestamps for record creation and updates.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "origami")
public class Origami {

    /**
     * Primary key for the Origami table.
     * <p>
     * This field is auto-generated for each origami record using the IDENTITY strategy,
     * ensuring unique identification of each record.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false, updatable = false)
    private Long id;

    /**
     * Foreign key referencing the user who created the origami.
     * <p>
     * This field links the origami record to a specific user in the "users" table,
     * ensuring traceability of ownership.
     */
    @Column(name = "user_id", nullable = false)
    private Long userId;

    /**
     * Name of the origami model.
     * <p>
     * This is a required field that stores the name assigned to the origami model
     * by the user. It must not be null.
     */
    @Column(name = "origami_name", nullable = false)
    private String origamiName;

    /**
     * Indicates whether the origami is public or private.
     * <p>
     * This boolean flag determines the visibility of the origami model.
     * It defaults to {@code false}, meaning the origami is private unless explicitly set to public.
     */
    @Column(name = "is_public", nullable = false)
    private boolean isPublic;

    /**
     * Average rating for the origami model.
     * <p>
     * This field stores the average rating given to the origami by users.
     * The value typically ranges from 0.0 to 5.0 and is updated based on user feedback.
     */
    @Column(name = "ratings", nullable = false)
    private double ratings;

    /**
     * Identifier of the user who created this origami record.
     * <p>
     * This field may be null if the record was created without explicitly specifying the creator.
     */
    @Column(name = "created_by")
    private String createdBy;

    /**
     * Identifier of the user who last updated this origami record.
     * <p>
     * This field may be null if the record has not been updated since its creation.
     */
    @Column(name = "updated_by")
    private String updatedBy;

    /**
     * Timestamp when this origami record was created.
     * <p>
     * This field is automatically set at the time of creation and cannot be updated afterward.
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    /**
     * Timestamp when this origami record was last updated.
     * <p>
     * This field is updated automatically whenever the record is modified.
     */
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}