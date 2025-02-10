package com.quickfolds.backend.geometry.model.database;

import com.quickfolds.backend.community.model.Origami;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.CascadeType;
import jakarta.persistence.OneToMany;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.OffsetDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "face")
public class Face {

    /**
     * Primary key for the Face table.
     * Auto-generated value for each Face record.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false, updatable = false)
    private Long id;

    /**
     * Foreign key to the Origami table.
     * Represents the ID of the associated Origami entity.
     */
    @Column(name = "origami_id", nullable = false)
    private Long origamiId;

    /**
     * Foreign key to the Step table.
     * Represents the ID of the step where this face was created or modified.
     * This field is not directly updatable or insertable.
     */
    @Column(name = "step_id", nullable = false)
    private Long stepId;

    /**
     * A unique identifier for this face within an Origami.
     * Used to differentiate multiple faces belonging to the same Origami.
     */
    @Column(name = "id_in_origami", nullable = false)
    private int idInOrigami;

    @Column(name = "deleted_step_id")
    private Long deletedStepId;

    /**
     * The username or identifier of the user who created this face.
     * May be null if not explicitly set.
     */
    @Column(name = "created_by")
    private String createdBy;

    /**
     * The username or identifier of the user who last updated this face.
     * May be null if not explicitly set.
     */
    @Column(name = "updated_by")
    private String updatedBy;

    /**
     * The timestamp when this face was created.
     * Automatically set and not updatable after creation.
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    /**
     * The timestamp when this face was last updated.
     * Updated automatically when modifications are made.
     */
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
