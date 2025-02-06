package com.quickfolds.backend.geometry.model;

import com.quickfolds.backend.community.model.Origami;
import jakarta.persistence.*;
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
@Table(name = "step")
public class Step {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false, updatable = false)
    private Long id;

    @Column(name = "origami_id", insertable = false, updatable = false)
    private Long origamiId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "origami_id", nullable = false)
    @JsonIgnore
    private Origami origami;

    @Column(name = "step_type_id", insertable = false, updatable = false)
    private Long stepTypeId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "step_type_id", nullable = false)
    private StepType stepType;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "updated_by")
    private String updatedBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    // Lazy-loaded one to many fields
    @OneToMany(mappedBy = "step", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JsonIgnore
    private List<AnnotatedPoint> annotatedPoints;

    @OneToMany(mappedBy = "step", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JsonIgnore
    private List<AnnotatedLine> annotatedLines;
}
