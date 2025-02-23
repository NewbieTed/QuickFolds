package com.quickfolds.backend.geometry.model.database;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.OffsetDateTime;

/**
 * Represents an edge that connects two faces in an origami model.
 * <p>
 * This entity stores details about the connected faces and the fold angle
 * between them. It maps to the "fold_edge" table in the database.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "fold_edge")
public class FoldEdge {

    /**
     * Primary key and foreign key referencing the associated edge.
     * <p>
     * - Cannot be null.
     * - References an existing record in the "edge" table.
     */
    @Id
    @Column(name = "edge_id", nullable = false, updatable = false)
    private Long edgeId;

    /**
     * Foreign key referencing the first face connected by the fold edge.
     * <p>
     * - Can be null if the face is not specified.
     * - Links to a specific face in the "face" table.
     */
    @Column(name = "face_1_id")
    private Long face1Id;

    /**
     * Foreign key referencing the second face connected by the fold edge.
     * <p>
     * - Can be null if the face is not specified.
     * - Links to a specific face in the "face" table.
     */
    @Column(name = "face_2_id")
    private Long face2Id;

    /**
     * The angle of the fold between the two connected faces.
     * <p>
     * - Cannot be null.
     * - Represents the fold angle in degrees.
     */
    @Column(name = "angle", nullable = false)
    private Double angle;

    /**
     * Edge number within the first face.
     * <p>
     * - Cannot be null.
     * - Used to differentiate multiple edges in the same face.
     */
    @Column(name = "id_in_face_1", nullable = false)
    private Integer idInFace1;

    /**
     * Edge number within the second face.
     * <p>
     * - Cannot be null.
     * - Used to differentiate multiple fold edges in the same face.
     */
    @Column(name = "id_in_face_2", nullable = false)
    private Integer idInFace2;

    /**
     * Identifier of the user who created this fold edge record.
     * <p>
     * - Can be null if not explicitly set.
     */
    @Column(name = "created_by")
    private String createdBy;

    /**
     * Identifier of the user who last updated this fold edge record.
     * <p>
     * - Can be null if not explicitly set.
     */
    @Column(name = "updated_by")
    private String updatedBy;

    /**
     * Timestamp when this fold edge record was created.
     * <p>
     * - Automatically set at the time of creation.
     * - Cannot be updated after creation.
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    /**
     * Timestamp when this fold edge record was last updated.
     * <p>
     * - Updated automatically when the record is modified.
     * - Can be null if no updates have occurred.
     */
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}