BEGIN;

-- Disable foreign key checks to avoid constraint issues during truncation.
SET CONSTRAINTS ALL DEFERRED;

-- Truncate all tables to clear their data while retaining structure.
TRUNCATE TABLE
    side_edge,
    fold_edge,
    edge,
    edge_type,
    annotated_line,
    annotated_point,
    origami_point,
    point_type,
    fold_step,
    face,
    step,
    step_type,
    origami,
    users
RESTART IDENTITY CASCADE;

-- Re-enable foreign key constraints.
SET CONSTRAINTS ALL IMMEDIATE;

COMMIT;


INSERT INTO step_type (step_type_name, created_by)
VALUES
  ('fold', 'admin'),
  ('create', 'admin'),
  ('annotate', 'admin'),
  ('rotate', 'admin');

INSERT INTO point_type (point_type_name, created_by)
VALUES
  ('vertex', 'admin'),
  ('annotated_point', 'admin');


INSERT INTO edge_type (edge_type_name, created_by)
VALUES
  ('side', 'admin'),
  ('fold', 'admin');