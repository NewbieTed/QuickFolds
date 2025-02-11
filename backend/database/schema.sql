BEGIN;

-- Create Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,

    created_by TEXT DEFAULT NULL,
    updated_by TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create Origami Table
CREATE TABLE origami (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    ratings DOUBLE PRECISION NOT NULL DEFAULT 0.0,

    created_by TEXT DEFAULT NULL,
    updated_by TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create Step Type Table
CREATE TABLE step_type (
    id BIGSERIAL PRIMARY KEY,
    step_type TEXT UNIQUE NOT NULL,

    created_by TEXT DEFAULT NULL,
    updated_by TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create Step Table
CREATE TABLE step (
    id BIGSERIAL PRIMARY KEY,
    origami_id BIGINT NOT NULL REFERENCES origami(id) ON DELETE CASCADE,
    step_type_id BIGINT NOT NULL REFERENCES step_type(id) ON DELETE RESTRICT,

    created_by TEXT DEFAULT NULL,
    updated_by TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create Face Table
CREATE TABLE face (
    id BIGSERIAL PRIMARY KEY,
    origami_id BIGINT NOT NULL REFERENCES origami(id) ON DELETE CASCADE,
    face_id_in_origami INTEGER NOT NULL,
    step_id BIGINT REFERENCES step(id) ON DELETE CASCADE,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,

    created_by TEXT DEFAULT NULL,
    updated_by TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create Fold Step Table
CREATE TABLE fold_step (
    step_id BIGINT PRIMARY KEY REFERENCES step(id) ON DELETE CASCADE,
    anchored_face_id BIGINT REFERENCES face(id) ON DELETE SET NULL,

    created_by TEXT DEFAULT NULL,
    updated_by TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create Vertex Table
CREATE TABLE vertex (
    id BIGSERIAL PRIMARY KEY,
    face_id BIGINT NOT NULL REFERENCES face(id) ON DELETE CASCADE,
    x_pos DOUBLE PRECISION NOT NULL,
    y_pos DOUBLE PRECISION NOT NULL,

    created_by TEXT DEFAULT NULL,
    updated_by TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create Edge Table
CREATE TABLE edge (
    id BIGSERIAL PRIMARY KEY,
    origami_id BIGINT NOT NULL REFERENCES origami(id) ON DELETE CASCADE,
    face_1_id BIGINT REFERENCES face(id) ON DELETE SET NULL,
    face_2_id BIGINT REFERENCES face(id) ON DELETE SET NULL,
    angle DOUBLE PRECISION NOT NULL,

    created_by TEXT DEFAULT NULL,
    updated_by TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create Annotated Point Table
CREATE TABLE annotated_point (
    id BIGSERIAL PRIMARY KEY,
    step_id BIGINT NOT NULL REFERENCES step(id) ON DELETE CASCADE,
    x_pos DOUBLE PRECISION NOT NULL,
    y_pos DOUBLE PRECISION NOT NULL,
    on_edge_id BIGINT REFERENCES edge(id) ON DELETE SET NULL,
    vertex_id BIGINT REFERENCES vertex(id) ON DELETE SET NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,

    created_by TEXT DEFAULT NULL,
    updated_by TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create Annotated Line Table
CREATE TABLE annotated_line (
    id BIGSERIAL PRIMARY KEY,
    step_id BIGINT NOT NULL REFERENCES step(id) ON DELETE CASCADE,
    point_1_id BIGINT NOT NULL REFERENCES annotated_point(id) ON DELETE CASCADE,
    point_2_id BIGINT NOT NULL REFERENCES annotated_point(id) ON DELETE CASCADE,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,

    created_by TEXT DEFAULT NULL,
    updated_by TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

COMMIT;
