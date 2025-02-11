BEGIN;

-- Create Users Table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,

    created_by TEXT DEFAULT NULL,
    updated_by TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE users IS 'Stores user credentials and metadata.';

COMMENT ON COLUMN users.id IS 'Unique identifier for the user.';
COMMENT ON COLUMN users.username IS 'Unique username for the user.';
COMMENT ON COLUMN users.password IS 'Encrypted password for the user.';

COMMENT ON COLUMN users.created_by IS 'Identifier of the user who created this record.';
COMMENT ON COLUMN users.updated_by IS 'Identifier of the user who last updated this record.';
COMMENT ON COLUMN users.created_at IS 'Timestamp when this user record was created.';
COMMENT ON COLUMN users.updated_at IS 'Timestamp when this user record was last updated.';


-- Create Origami Table
CREATE TABLE origami (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    ratings DOUBLE PRECISION NOT NULL DEFAULT 0.0 CHECK (ratings >= 0.0 AND ratings <= 5.0),

    created_by TEXT DEFAULT NULL,
    updated_by TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE origami IS 'Stores details about origami models created by users.';

COMMENT ON COLUMN origami.id IS 'Unique identifier for the origami.';
COMMENT ON COLUMN origami.user_id IS 'Foreign key referencing the user who created the origami.';
COMMENT ON COLUMN origami.is_public IS 'Indicates whether the origami is public or private.';
COMMENT ON COLUMN origami.ratings IS 'Average rating for the origami model.';

COMMENT ON COLUMN origami.created_by IS 'Identifier of the user who created this origami record.';
COMMENT ON COLUMN origami.updated_by IS 'Identifier of the user who last updated this origami record.';
COMMENT ON COLUMN origami.created_at IS 'Timestamp when this origami record was created.';
COMMENT ON COLUMN origami.updated_at IS 'Timestamp when this origami record was last updated.';


-- Create Step Type Table
CREATE TABLE step_type (
    id BIGSERIAL PRIMARY KEY,
    step_type_name TEXT UNIQUE NOT NULL,

    created_by TEXT DEFAULT NULL,
    updated_by TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE step_type IS 'Stores the predefined types of steps that can be applied to an origami.';

COMMENT ON COLUMN step_type.id IS 'Unique identifier for the step type.';
COMMENT ON COLUMN step_type.step_type_name IS 'Name of the step type, such as fold or annotate.';

COMMENT ON COLUMN step_type.created_by IS 'Identifier of the user who created this step type record.';
COMMENT ON COLUMN step_type.updated_by IS 'Identifier of the user who last updated this step type record.';
COMMENT ON COLUMN step_type.created_at IS 'Timestamp when this step type record was created.';
COMMENT ON COLUMN step_type.updated_at IS 'Timestamp when this step type record was last updated.';


-- Create Step Table
CREATE TABLE step (
    id BIGSERIAL PRIMARY KEY,
    origami_id BIGINT NOT NULL REFERENCES origami(id) ON DELETE CASCADE,
    step_type_id BIGINT NOT NULL REFERENCES step_type(id) ON DELETE RESTRICT,
    id_in_origami INTEGER NOT NULL,

    created_by TEXT DEFAULT NULL,
    updated_by TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE step IS 'Represents individual steps in an origami process, with references to the origami and step type.';

COMMENT ON COLUMN step.id IS 'Unique identifier for the step.';
COMMENT ON COLUMN step.origami_id IS 'Foreign key referencing the origami associated with this step.';
COMMENT ON COLUMN step.step_type_id IS 'Foreign key referencing the type of step (e.g., fold or annotate).';
COMMENT ON COLUMN step.id_in_origami IS 'Step number within the origami sequence.';

COMMENT ON COLUMN step.created_by IS 'Identifier of the user who created this step record.';
COMMENT ON COLUMN step.updated_by IS 'Identifier of the user who last updated this step record.';
COMMENT ON COLUMN step.created_at IS 'Timestamp when this step record was created.';
COMMENT ON COLUMN step.updated_at IS 'Timestamp when this step record was last updated.';


-- Create Face Table
CREATE TABLE face (
    id BIGSERIAL PRIMARY KEY,
    origami_id BIGINT NOT NULL REFERENCES origami(id) ON DELETE CASCADE,
    step_id BIGINT REFERENCES step(id) ON DELETE CASCADE ON UPDATE CASCADE,
    id_in_origami INTEGER NOT NULL,
    deleted_step_id BIGINT REFERENCES step(id) ON DELETE CASCADE ON UPDATE CASCADE,

    created_by TEXT DEFAULT NULL,
    updated_by TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE face IS 'Represents faces of an origami, typically created during a specific step in the process.';

COMMENT ON COLUMN face.id IS 'Unique identifier for the face.';
COMMENT ON COLUMN face.origami_id IS 'Foreign key referencing the origami this face belongs to.';
COMMENT ON COLUMN face.step_id IS 'Foreign key referencing the step during which this face was created.';
COMMENT ON COLUMN face.id_in_origami IS 'Face number within the origami.';
COMMENT ON COLUMN face.deleted_step_id IS 'Foreign key referencing the step where this face is deleted.';

COMMENT ON COLUMN face.created_by IS 'Identifier of the user who created this face record.';
COMMENT ON COLUMN face.updated_by IS 'Identifier of the user who last updated this face record.';
COMMENT ON COLUMN face.created_at IS 'Timestamp when this face record was created.';
COMMENT ON COLUMN face.updated_at IS 'Timestamp when this face record was last updated.';


-- Create Fold Step Table
CREATE TABLE fold_step (
    step_id BIGINT PRIMARY KEY REFERENCES step(id) ON DELETE CASCADE ON UPDATE CASCADE,
    anchored_face_id BIGINT REFERENCES face(id) ON DELETE RESTRICT,

    created_by TEXT DEFAULT NULL,
    updated_by TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE fold_step IS 'Stores additional details for folding steps, linking the step to a specific anchored face.';

COMMENT ON COLUMN fold_step.step_id IS 'Primary key and foreign key referencing the associated step.';
COMMENT ON COLUMN fold_step.anchored_face_id IS 'Foreign key referencing the face used as a reference (anchored face) in the fold.';

COMMENT ON COLUMN fold_step.created_by IS 'Identifier of the user who created this fold step record.';
COMMENT ON COLUMN fold_step.updated_by IS 'Identifier of the user who last updated this fold step record.';
COMMENT ON COLUMN fold_step.created_at IS 'Timestamp when this fold step record was created.';
COMMENT ON COLUMN fold_step.updated_at IS 'Timestamp when this fold step record was last updated.';


-- Create Vertex Table
CREATE TABLE vertex (
    id BIGSERIAL PRIMARY KEY,
    step_id BIGINT NOT NULL REFERENCES step(id) ON DELETE CASCADE ON UPDATE CASCADE,
    face_id BIGINT NOT NULL REFERENCES face(id) ON DELETE CASCADE ON UPDATE CASCADE,
    x_pos DOUBLE PRECISION NOT NULL,
    y_pos DOUBLE PRECISION NOT NULL,
    id_in_face INTEGER NOT NULL,
    deleted_step_id BIGINT REFERENCES step(id) ON DELETE CASCADE ON UPDATE CASCADE,

    created_by TEXT DEFAULT NULL,
    updated_by TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE vertex IS 'Stores the coordinates (x, y) of vertices for a face in the origami.';

COMMENT ON COLUMN vertex.id IS 'Unique identifier for the vertex.';
COMMENT ON COLUMN vertex.step_id IS 'Foreign key referencing the step where this vertex is created.';
COMMENT ON COLUMN vertex.face_id IS 'Foreign key referencing the face to which this vertex belongs.';
COMMENT ON COLUMN vertex.x_pos IS 'X-coordinate of the vertex.';
COMMENT ON COLUMN vertex.y_pos IS 'Y-coordinate of the vertex.';
COMMENT ON COLUMN vertex.id_in_face IS 'Vertex number within the face.';
COMMENT ON COLUMN vertex.deleted_step_id IS 'Foreign key referencing the step where this vertex is deleted.';

COMMENT ON COLUMN vertex.created_by IS 'Identifier of the user who created this vertex record.';
COMMENT ON COLUMN vertex.updated_by IS 'Identifier of the user who last updated this vertex record.';
COMMENT ON COLUMN vertex.created_at IS 'Timestamp when this vertex record was created.';
COMMENT ON COLUMN vertex.updated_at IS 'Timestamp when this vertex record was last updated.';


-- Create Edge Table
CREATE TABLE edge (
    id BIGSERIAL PRIMARY KEY,
    step_id BIGINT NOT NULL REFERENCES step(id) ON DELETE CASCADE ON UPDATE CASCADE,
    face_1_id BIGINT REFERENCES face(id) ON DELETE CASCADE ON UPDATE CASCADE,
    face_2_id BIGINT REFERENCES face(id) ON DELETE CASCADE ON UPDATE CASCADE,
    angle DOUBLE PRECISION NOT NULL,
    id_in_face_1 INTEGER NOT NULL,
    id_in_face_2 INTEGER NOT NULL,
    deleted_step_id BIGINT REFERENCES step(id) ON DELETE CASCADE ON UPDATE CASCADE,

    created_by TEXT DEFAULT NULL,
    updated_by TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE edge IS 'Represents edges that connect faces in an origami, including the angle between connected faces.';

COMMENT ON COLUMN edge.id IS 'Unique identifier for the edge.';
COMMENT ON COLUMN edge.step_id IS 'Foreign key referencing the step where this edge is created.';
COMMENT ON COLUMN edge.face_1_id IS 'Foreign key referencing the first face connected by the edge.';
COMMENT ON COLUMN edge.face_2_id IS 'Foreign key referencing the second face connected by the edge.';
COMMENT ON COLUMN edge.angle IS 'Angle of the edge between the two connected faces.';
COMMENT ON COLUMN edge.id_in_face_1 IS 'Edge number within the first face.';
COMMENT ON COLUMN edge.id_in_face_2 IS 'Edge number within the second face.';
COMMENT ON COLUMN edge.deleted_step_id IS 'Foreign key referencing the step where this edge is deleted.';

COMMENT ON COLUMN edge.created_by IS 'Identifier of the user who created this edge record.';
COMMENT ON COLUMN edge.updated_by IS 'Identifier of the user who last updated this edge record.';
COMMENT ON COLUMN edge.created_at IS 'Timestamp when this edge record was created.';
COMMENT ON COLUMN edge.updated_at IS 'Timestamp when this edge record was last updated.';


-- Create Annotated Point Table
CREATE TABLE annotated_point (
    id BIGSERIAL PRIMARY KEY,
    step_id BIGINT NOT NULL REFERENCES step(id) ON DELETE CASCADE ON UPDATE CASCADE,
    face_id BIGINT NOT NULL REFERENCES face(id) ON DELETE CASCADE ON UPDATE CASCADE,
    x_pos DOUBLE PRECISION NOT NULL,
    y_pos DOUBLE PRECISION NOT NULL,
    on_edge_id BIGINT REFERENCES edge(id) ON DELETE CASCADE ON UPDATE CASCADE,
    vertex_id BIGINT REFERENCES vertex(id) ON DELETE CASCADE ON UPDATE CASCADE,
    id_in_face INTEGER NOT NULL,
    deleted_step_id BIGINT REFERENCES step(id) ON DELETE CASCADE ON UPDATE CASCADE,

    created_by TEXT DEFAULT NULL,
    updated_by TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE annotated_point IS 'Stores points annotated in a specific step, associated with edges or vertices.';

COMMENT ON COLUMN annotated_point.id IS 'Unique identifier for the annotated point.';
COMMENT ON COLUMN annotated_point.step_id IS 'Foreign key referencing the step where this point was annotated.';
COMMENT ON COLUMN annotated_point.face_id IS 'Foreign key referencing the face to which this annotated point belongs.';
COMMENT ON COLUMN annotated_point.x_pos IS 'X-coordinate of the point.';
COMMENT ON COLUMN annotated_point.y_pos IS 'Y-coordinate of the point.';
COMMENT ON COLUMN annotated_point.on_edge_id IS 'Foreign key referencing the edge where this point lies, if any.';
COMMENT ON COLUMN annotated_point.vertex_id IS 'Foreign key referencing the vertex associated with this point, if any.';
COMMENT ON COLUMN annotated_point.id_in_face IS 'Point number within the face.';
COMMENT ON COLUMN annotated_point.deleted_step_id IS 'Foreign key referencing the step where this point is deleted.';

COMMENT ON COLUMN annotated_point.created_by IS 'Identifier of the user who created this point record.';
COMMENT ON COLUMN annotated_point.updated_by IS 'Identifier of the user who last updated this point record.';
COMMENT ON COLUMN annotated_point.created_at IS 'Timestamp when this point record was created.';
COMMENT ON COLUMN annotated_point.updated_at IS 'Timestamp when this point record was last updated.';


-- Create Annotated Line Table
CREATE TABLE annotated_line (
    id BIGSERIAL PRIMARY KEY,
    step_id BIGINT NOT NULL REFERENCES step(id) ON DELETE CASCADE ON UPDATE CASCADE,
    face_id BIGINT NOT NULL REFERENCES face(id) ON DELETE CASCADE ON UPDATE CASCADE,
    point_1_id BIGINT NOT NULL REFERENCES annotated_point(id) ON DELETE CASCADE ON UPDATE CASCADE,
    point_2_id BIGINT NOT NULL REFERENCES annotated_point(id) ON DELETE CASCADE ON UPDATE CASCADE,
    id_in_face INTEGER NOT NULL,
    deleted_step_id BIGINT REFERENCES step(id) ON DELETE CASCADE ON UPDATE CASCADE,

    created_by TEXT DEFAULT NULL,
    updated_by TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE annotated_line IS 'Stores lines drawn in a specific step, connecting two annotated points.';

COMMENT ON COLUMN annotated_line.id IS 'Unique identifier for the annotated line.';
COMMENT ON COLUMN annotated_line.step_id IS 'Foreign key referencing the step where this line was drawn.';
COMMENT ON COLUMN annotated_line.face_id IS 'Foreign key referencing the face to which this annotated line belongs.';
COMMENT ON COLUMN annotated_line.point_1_id IS 'Foreign key referencing the first point of the line.';
COMMENT ON COLUMN annotated_line.point_2_id IS 'Foreign key referencing the second point of the line.';
COMMENT ON COLUMN annotated_line.id_in_face IS 'Line number within the face.';
COMMENT ON COLUMN annotated_line.deleted_step_id IS 'Foreign key referencing the step where this line is deleted.';

COMMENT ON COLUMN annotated_line.created_by IS 'Identifier of the user who created this line record.';
COMMENT ON COLUMN annotated_line.updated_by IS 'Identifier of the user who last updated this line record.';
COMMENT ON COLUMN annotated_line.created_at IS 'Timestamp when this line record was created.';
COMMENT ON COLUMN annotated_line.updated_at IS 'Timestamp when this line record was last updated.';


CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    -- Automatically update the "updated_at" field to the current timestamp
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- Users Table
CREATE TRIGGER trigger_update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Origami Table
CREATE TRIGGER trigger_update_origami_updated_at
BEFORE UPDATE ON origami
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Step Type Table
CREATE TRIGGER trigger_update_step_type_updated_at
BEFORE UPDATE ON step_type
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Step Table
CREATE TRIGGER trigger_update_step_updated_at
BEFORE UPDATE ON step
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Face Table
CREATE TRIGGER trigger_update_face_updated_at
BEFORE UPDATE ON face
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Fold Step Table
CREATE TRIGGER trigger_update_fold_step_updated_at
BEFORE UPDATE ON fold_step
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Vertex Table
CREATE TRIGGER trigger_update_vertex_updated_at
BEFORE UPDATE ON vertex
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Edge Table
CREATE TRIGGER trigger_update_edge_updated_at
BEFORE UPDATE ON edge
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Annotated Point Table
CREATE TRIGGER trigger_update_annotated_point_updated_at
BEFORE UPDATE ON annotated_point
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Annotated Line Table
CREATE TRIGGER trigger_update_annotated_line_updated_at
BEFORE UPDATE ON annotated_line
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


-- Indexes for Foreign Keys
CREATE INDEX idx_origami_user_id ON origami(user_id);
CREATE INDEX idx_step_origami_id ON step(origami_id);
CREATE INDEX idx_face_origami_id ON face(origami_id);
CREATE INDEX idx_face_step_id ON face(step_id);
CREATE INDEX idx_face_deleted_step_id ON face(deleted_step_id);
CREATE INDEX idx_vertex_face_id ON vertex(face_id);
CREATE INDEX idx_vertex_deleted_step_id ON vertex(deleted_step_id);
CREATE INDEX idx_edge_face_1_id ON edge(face_1_id);
CREATE INDEX idx_edge_face_2_id ON edge(face_2_id);
CREATE INDEX idx_edge_deleted_step_id ON edge(deleted_step_id);
CREATE INDEX idx_annotated_point_step_id ON annotated_point(step_id);
CREATE INDEX idx_annotated_point_face_id ON annotated_point(face_id);
CREATE INDEX idx_annotated_point_on_edge_id ON annotated_point(on_edge_id);
CREATE INDEX idx_annotated_point_vertex_id ON annotated_point(vertex_id);
CREATE INDEX idx_annotated_point_deleted_step_id ON annotated_point(deleted_step_id);
CREATE INDEX idx_annotated_line_step_id ON annotated_line(step_id);
CREATE INDEX idx_annotated_line_face_id ON annotated_line(face_id);
CREATE INDEX idx_annotated_line_point_1_id ON annotated_line(point_1_id);
CREATE INDEX idx_annotated_line_point_2_id ON annotated_line(point_2_id);
CREATE INDEX idx_annotated_line_deleted_step_id ON annotated_line(deleted_step_id);


COMMIT;
