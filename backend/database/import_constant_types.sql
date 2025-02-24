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