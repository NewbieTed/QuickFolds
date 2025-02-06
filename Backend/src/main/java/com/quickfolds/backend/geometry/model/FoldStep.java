package com.quickfolds.backend.geometry.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "fold_step")
public class FoldStep {

    @Id
    @Column(name = "step_id", nullable = false, updatable = false)
    private Long stepId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "step_id", nullable = false)
    @MapsId
    @JsonIgnore
    private Step step;

    @Column(name = "anchored_face_id", insertable = false, updatable = false)
    private Long anchoredFaceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "anchored_face_id")
    @JsonIgnore
    private Face anchoredFace;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "updated_by")
    private String updatedBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
