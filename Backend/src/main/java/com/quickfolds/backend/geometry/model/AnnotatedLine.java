package com.quickfolds.backend.geometry.model;

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
@Table(name = "annotated_line")
public class AnnotatedLine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false, updatable = false)
    private Long id;

    @Column(name = "step_id", insertable = false, updatable = false)
    private Long stepId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "step_id", nullable = false)
    private Step step;

    @Column(name = "point_1_id", insertable = false, updatable = false)
    private Long point1Id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "point_1_id", nullable = false)
    private AnnotatedPoint point1;

    @Column(name = "point_2_id", insertable = false, updatable = false)
    private Long point2Id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "point_2_id", nullable = false)
    private AnnotatedPoint point2;

    @Column(name = "is_deleted", nullable = false)
    private boolean isDeleted;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "updated_by")
    private String updatedBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
