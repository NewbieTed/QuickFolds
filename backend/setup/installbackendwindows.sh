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

    while IFS='=' read -r key value; do
        # Ignore empty lines and comments
        if [[ -n "$key" && "$key" != \#* ]]; then
            export "$key=$value"
        fi
    done < "$file"

    echo "Loaded environment variables from: $file"
done

# run docker in background
docker compose up -d

mvn clean install

mvn spring-boot:run -d

# id of container
CONTAINER_ID=$(docker ps --filter "name=quickfolds-db-local" --format "{{.ID}}")

docker cp Reset_Dummy_Data.sql $CONTAINER_ID:/file.sql

docker exec -i $CONTAINER_ID psql -U local_user -d quickfolds_local -f /file.sql

#docker stop $(docker ps -q)
#pkill -f "mvn"

cd windowssetup