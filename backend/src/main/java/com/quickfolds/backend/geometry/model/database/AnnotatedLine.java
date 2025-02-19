package com.quickfolds.backend.geometry.model.database;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.OffsetDateTime;

/**
 * Represents a line annotated on a face of an origami model during a specific step.
 * Stores the associations of the line, which connects two annotated points.
 * Maps to the "annotated_line" table in the database.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "annotated_line")
public class AnnotatedLine {

    /**
     * Unique identifier for the annotated line.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false, updatable = false)
    private Long id;

    /**
     * Foreign key referencing the step where this line was annotated.
     * Links to a specific step in the "step" table.
     */
    @Column(name = "step_id", nullable = false)
    private Long stepId;

    /**
     * Foreign key referencing the face to which this annotated line belongs.
     * Links to a specific face in the "face" table.
     */
    @Column(name = "face_id", nullable = false)
    private Long faceId;

    /**
     * Foreign key referencing the first point of the line.
     * Links to a specific point in the "origami_point" table.
     */
    @Column(name = "point_1_id", nullable = false)
    private Long point1Id;

    /**
     * Foreign key referencing the second point of the line.
     * Links to a specific point in the "origami_point" table.
     */
    @Column(name = "point_2_id", nullable = false)
    private Long point2Id;

    /**
     * The line number within the face.
     * Used to differentiate multiple annotated lines in the same face.
     */
    @Column(name = "id_in_face", nullable = false)
    private Integer idInFace;

    /**
     * Foreign key referencing the step where this annotated line was deleted.
     * Null if the line has not been deleted.
     */
    @Column(name = "deleted_step_id")
    private Long deletedStepId;

    /**
     * Identifier of the user who created this annotated line record.
     * May be null if not explicitly set.
     */
    @Column(name = "created_by")
    private String createdBy;

    /**
     * Identifier of the user who last updated this annotated line record.
     * May be null if not explicitly set.
     */
    @Column(name = "updated_by")
    private String updatedBy;

    /**
     * Timestamp when this annotated line record was created.
     * Automatically set at the time of creation and not updatable.
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    /**
     * Timestamp when this annotated line record was last updated.
     * Updated automatically when the record is modified.
     */
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}