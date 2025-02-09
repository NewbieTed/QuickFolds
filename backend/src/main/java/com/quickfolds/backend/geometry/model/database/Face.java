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
     * This field is not directly updatable or insertable.
     */
    @Column(name = "origami_id", insertable = false, updatable = false)
    private Long origamiId;

    /**
     * Many-to-one relationship to the Origami entity.
     * Used to fetch the Origami this Face belongs to.
     * Lazy loading is used to optimize performance.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "origami_id", nullable = false)
    @JsonIgnore
    private Origami origami;

    /**
     * A unique identifier for this face within an Origami.
     * Used to differentiate multiple faces belonging to the same Origami.
     */
    @Column(name = "id_in_origami", nullable = false)
    private int idInOrigami;

    /**
     * Foreign key to the Step table.
     * Represents the ID of the step where this face was created or modified.
     * This field is not directly updatable or insertable.
     */
    @Column(name = "step_id", insertable = false, updatable = false)
    private Long stepId;

    /**
     * Many-to-one relationship to the Step entity.
     * Represents the folding step this face is associated with.
     * Lazy loading is used to improve performance.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "step_id")
    @JsonIgnore
    private Step step;

    /**
     * Indicates whether this face is marked as deleted.
     * True if the face is deleted, false otherwise.
     */
    @Column(name = "is_deleted", nullable = false)
    private boolean isDeleted;

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

    /**
     * One-to-many relationship to the Vertex entity.
     * Represents the vertices that define the polygon for this face.
     * Lazy loading is used to optimize performance.
     * Cascade operations are enabled to handle related Vertex entities.
     */
    @OneToMany(mappedBy = "face", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Vertex> vertices;

}
