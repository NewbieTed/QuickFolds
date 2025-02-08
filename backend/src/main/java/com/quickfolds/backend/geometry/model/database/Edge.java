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

    @Column(name = "origami_id", insertable = false, updatable = false)
    private Long origamiId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "origami_id", nullable = false)
    private Origami origami;

    @Column(name = "face_1_id", insertable = false, updatable = false)
    private Long face1Id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "face_1_id")
    private Face face1;

    @Column(name = "face_2_id", insertable = false, updatable = false)
    private Long face2Id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "face_2_id")
    private Face face2;

    @Column(name = "angle", nullable = false)
    private double angle;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "updated_by")
    private String updatedBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
