package com.quickfolds.backend.geometry.model.database;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.OffsetDateTime;

/**
 * Represents an edge on the side of a face that does not connect to any other face.
 * <p>
 * This entity maps to the "side_edge" table in the database and stores metadata
 * about side edges, including their associated vertices, face, and lifecycle timestamps.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "side_edge")
public class SideEdge {

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
     * Foreign key referencing the first vertex connected by the edge.
     * <p>
     * - Cannot be null.
     * - Links to a specific vertex in the "origami_point" table.
     */
    @Column(name = "vertex_1_id", nullable = false)
    private Long vertex1Id;

    /**
     * Foreign key referencing the second vertex connected by the edge.
     * <p>
     * - Cannot be null.
     * - Links to a specific vertex in the "origami_point" table.
     */
    @Column(name = "vertex_2_id", nullable = false)
    private Long vertex2Id;

    /**
     * Foreign key referencing the face associated with the side edge.
     * <p>
     * - Cannot be null.
     * - Links to a specific face in the "face" table.
     */
    @Column(name = "face_id", nullable = false)
    private Long faceId;

    /**
     * Edge number within the face.
     * <p>
     * - Cannot be null.
     * - Used to differentiate multiple side edges in the same face.
     */
    @Column(name = "id_in_face", nullable = false)
    private Integer idInFace;

    /**
     * Identifier of the user who created this side edge record.
     * <p>
     * - May be null if not explicitly set.
     */
    @Column(name = "created_by")
    private String createdBy;

    /**
     * Identifier of the user who last updated this side edge record.
     * <p>
     * - May be null if not explicitly set.
     */
    @Column(name = "updated_by")
    private String updatedBy;

    /**
     * Timestamp when this side edge record was created.
     * <p>
     * - Automatically set at the time of creation.
     * - Cannot be updated after creation.
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    /**
     * Timestamp when this side edge record was last updated.
     * <p>
     * - Updated automatically when the record is modified.
     * - Can be null if no updates have occurred.
     */
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}