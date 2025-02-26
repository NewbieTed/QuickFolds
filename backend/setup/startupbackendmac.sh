#!/bin/bash
cd ..

# Check if the env directory exists
if [[ ! -d "env" ]]; then
    echo "The 'env/' directory does not exist."
    exit 1
fi

# Find .env files in the env directory
env_files=$(find env -type f -name "*.env")

# If no .env files are found
if [[ -z "$env_files" ]]; then
    echo "No .env files found in env/ directory."
    exit 1
fi

# Loop through each .env file and set variables
for file in $env_files; do
    echo "Processing: $file"
    export $(grep -v '^#' "$file" | xargs)
    echo "Loaded environment variables from: $file"
done

# Run Docker in background
docker compose up -d

# Build and run Spring Boot app
mvn clean install

mvn spring-boot:run -D

# Get container ID for the PostgreSQL container
CONTAINER_ID=$(docker ps --filter "name=quickfolds-db-local" --format "{{.ID}}")

# Copy SQL file to container
docker cp Reset_Dummy_Data.sql "$CONTAINER_ID":/file.sql

# Execute SQL file inside the container
docker exec -i "$CONTAINER_ID" psql -U local_user -d quickfolds_local -f /file.sql

# Uncomment to stop Docker containers and Maven if needed
# docker stop $(docker ps -q)
# pkill -f "mvn"

# Navigate to setup equivalent folder
cd setup
