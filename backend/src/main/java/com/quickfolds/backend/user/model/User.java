package com.quickfolds.backend.user.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.quickfolds.backend.community.model.Origami;
import jakarta.persistence.*;
import lombok.*;
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

/**
 * Represents a user entity in the system.
 * Maps to the "users" table in the database.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users")
public class User {

    /**
     * Primary key for the User table.
     * Auto-generated value for each User record.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false, updatable = false)
    private Long id;

    /**
     * Unique username for the user.
     * Acts as a unique identifier for user login or interaction.
     */
    @Getter
    @Setter
    @Column(name = "username", nullable = false, unique = true)
    private String username;

    /**
     * Encrypted password for the user.
     * This field is stored securely.
     */
    @Getter
    @Setter
    @Column(name = "password", nullable = false)
    private String password;

    /**
     * Identifier of the user who created this record.
     * May be null if not explicitly set.
     */
    @Column(name = "created_by")
    private String createdBy;

    /**
     * Identifier of the user who last updated this record.
     * May be null if not explicitly set.
     */
    @Column(name = "updated_by")
    private String updatedBy;

    /**
     * Timestamp when this user record was created.
     * Automatically set at the time of creation and not updatable.
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    /**
     * Timestamp when this user record was last updated.
     * Updated automatically when the record is modified.
     */
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
  
}
