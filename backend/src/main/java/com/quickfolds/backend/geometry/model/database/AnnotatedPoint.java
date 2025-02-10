package com.quickfolds.backend.geometry.model.database;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "annotated_point")
public class AnnotatedPoint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false, updatable = false)
    private Long id;

    @Column(name = "step_id", nullable = false)
    private Long stepId;

    @Column(name = "face_id", nullable = false)
    private Long faceId;

    @Column(name = "x_pos", nullable = false)
    private double xPos;

    @Column(name = "y_pos", nullable = false)
    private double yPos;

    @Column(name = "on_edge_id", nullable = false)
    private Long onEdgeId;

    @Column(name = "vertex_id", nullable = false)
    private Long vertexId;

    @Column(name = "id_in_face", nullable = false)
    private int idInFace;

    @Column(name = "deleted_step_id")
    private Long deletedStepId;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "updated_by")
    private String updatedBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
