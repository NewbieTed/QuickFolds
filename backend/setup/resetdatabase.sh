cd ..

# id of container
CONTAINER_ID=$(docker ps --filter "name=quickfolds-db-local" --format "{{.ID}}")

docker cp Reset_Dummy_Data.sql $CONTAINER_ID:/file.sql

docker exec -i $CONTAINER_ID psql -U local_user -d quickfolds_local -f /file.sql

cd setup