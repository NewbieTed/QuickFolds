package com.quickfolds.backend.geometry.model.database;

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

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "edge")
public class Edge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false, updatable = false)
    private Long id;

    @Column(name = "step_id", nullable = false)
    private Long stepId;

    @Column(name = "face_1_id", nullable = false)
    private Long face1Id;

    @Column(name = "face_2_id", nullable = false)
    private Long face2Id;

    @Column(name = "angle", nullable = false)
    private double angle;

    @Column(name = "id_in_face_1", nullable = false)
    private Integer idInFace1;

    @Column(name = "id_in_face_2", nullable = false)
    private Integer idInFace2;

    @Column(name = "deleted_step_id")
    private Long deleted_step;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "updated_by")
    private String updatedBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
