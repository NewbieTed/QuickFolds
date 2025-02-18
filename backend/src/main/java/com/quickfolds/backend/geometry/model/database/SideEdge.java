package com.quickfolds.backend.geometry.model.database;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.OffsetDateTime;

/**
 * Represents an edge on the side of a face that does not connect to any other face.
 * Maps to the "side_edge" table in the database.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "side_edge")
public class SideEdge {

    /**
     * Primary key and foreign key referencing the associated edge.
     */
    @Id
    @Column(name = "edge_id", nullable = false, updatable = false)
    private Long edgeId;

    /**
     * Foreign key referencing the first vertex connected by the edge.
     * Links to a specific vertex in the "origami_point" table.
     */
    @Column(name = "vertex_1_id")
    private Long vertex1Id;

    /**
     * Foreign key referencing the second vertex connected by the edge.
     * Links to a specific vertex in the "origami_point" table.
     */
    @Column(name = "vertex_2_id")
    private Long vertex2Id;

    /**
     * Foreign key referencing the face connected by the side edge.
     * Links to a specific face in the "face" table.
     */
    @Column(name = "face_id")
    private Long faceId;

    /**
     * Edge number within the face.
     * Used to differentiate multiple edges in the same face.
     */
    @Column(name = "id_in_face", nullable = false)
    private Integer idInFace;


    /**
     * Identifier of the user who created this side edge record.
     * May be null if not explicitly set.
     */
    @Column(name = "created_by")
    private String createdBy;

    /**
     * Identifier of the user who last updated this side edge record.
     * May be null if not explicitly set.
     */
    @Column(name = "updated_by")
    private String updatedBy;

    /**
     * Timestamp when this side edge record was created.
     * Automatically set at the time of creation and not updatable.
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    /**
     * Timestamp when this side edge record was last updated.
     * Updated automatically when the record is modified.
     */
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}