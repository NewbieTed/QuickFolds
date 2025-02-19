# QuickFolds

## Overview

### Idea of Project

QuickFolds is a Web Application Designed for those who create their own origami and
want to share it with others in the community, but don't want to do it through paper
instructions, or videos where the hands often get in the way. QuickFolds allows
user to create _animations_ for their origami, without needing to have a steep learning curve
with programs such as Blender and Maya. QuickFolds allows user to edit
their origami through Mountain and Valley Folds, and creating step-by-step actions
to showcase their creations with others.

### Repository Structure

There are Three main folders in our repository: Frontend, Backend, and Status reports

+ Status Reports will hold the template and weekly reports

+ Frontend contains all the HTML, CSS, and JS needed to display the website. Inside frontend
contains a public and src folder. The public folder is designed for static files (such as images and
basic CSS), while the src folder contains module dependent code (such as JS files that need Three.js)

+ Backend Folder will contain all the Spring Boot code needed


## Current Setup

### Frontend

#### Add Modules

Go to your terminal and run:
`npm install`

This should install all the current modules needed:

We currently are using these modules:

+ _Three.js_ - a library used to render 3d scene

+ _Vite_ - a local development server that compiles well with Three.js [you can think of this as npm run dev]

Once `npm install` finishes, you can run the editor:

#### Running The Editor

1. Go to your terminal and type  `npx vite`, this creates a local host server that renders any Three.js code

2. If sucessfull, you should see `VITE vX.X.XX ready...`

3. Below the message in 2., you should see text saying `Local: http:/localhost:PORT_NUMBER_HERE/`, this is where your localhost is running (usually 5173)

4. Pressing this should result in `This localhost page can’t be found`. _THIS IS INTENDED_. Vite is looking for a index.html file (the "base file" in any web server). However, with multiple people working on this at once, we won't do this [and it's also good practice]. Instead, you can access the file you want putting the directory path`http:/localhost:PORT_NUMBER_HERE/PATH.html`

5. To open the editor, type in `http:/localhost:PORT_NUMBER_HERE/Frontend/public/editor.html`. Normally, you can just do `/editor.html` without the directories in front, but because we have both front-end and back-end at the same time, Vite doesn't see the `public/` directory inside frontend, so we have to manually list it.

6. The editor should appear and you should be good to go


#### Editor Settings

Here are the current things you can do in the editor when looking around

+ Pressing Left Mouse Button: Let's You rotate the camera around a center point

+ Pressing Left Mouse Button + Pressing Shift: Allows you to move the point/camera itself in space

+ Pressing 'p': hides the center point the camera rotates from

+ Presssing 'r': resets the rotating point back to origin

## Backend

### Prerequisites
Ensure you have the following installed:

1. Java Development Kit (JDK 21+)

2. Maven (If not using the provided `mvnw` script; any `mvn` and `mvnw` comands are interchangable) 

3. PostgreSQL (if using a local database)

4. Docker (if using `docker-compose` for database setup)  
   Download and install Docker Desktop from:  
   [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### Setup

#### Environment variables

Environmental variables are contained in an env.zip file that will not be added to the remote repository due to containing sensitive information.

Unzip the file and put the resulting folder into the backend root folder Quickfolds/backend. This folder should contain two other folders: a folder env that contains the .env files and a _MACOSX file for Macs.

#### Loading environment variables:

Mac: 
Copy the sample environment variables and configure them:
   ```sh
   cp env/.env.example env/.env
   nano env/.env  # Edit as needed
   ```
Load the environment variables:
   ```sh
   export $(grep -v '^#' env/local.env | xargs)
  ```

Windows: run the following script in the terminal:
```
Get-ChildItem -Path "path\to\env" -Filter "*.env" | ForEach-Object { 
    $filePath = $_.FullName  
    Get-Content $filePath | ForEach-Object { 
        if ($_ -notmatch "^\s*#|^\s*$") {
            $parts = $_ -split '=', 2
            [System.Environment]::SetEnvironmentVariable($parts[0].Trim(), $parts[1].Trim(), "Process")
        }
    }
}
```
Where path\to\env is replaced with your relative path to the unzipped folder env that contains the .env files. This will temporarily load the environmental variables to your current terminal session. This script has to be rerun whenever a new terminal sesion is started.

#### Start PostgreSQL Database
- Using Docker:
  ```sh
  docker compose up
  ```
- Using Local PostgreSQL:
  ```sh
  psql -U postgres -c "CREATE DATABASE mydb;"
  ```

#### Build and Run the Application
   ```sh
   ./mvnw clean install
   java -jar target/backend-0.0.1-SNAPSHOT.jar
   ```
   Or to start the localhost:
   ```sh
   ./mvnw spring-boot:run
   ```
   To only run tests:
   ```sh
   ./mvnw test
   ```

#### Database Migrations
Execute the schema SQL file in `<Quickfolds/backend/database>`.

#### Troubleshooting
- Port Conflicts: Ensure `8080` and `5432` are available.
- Permissions Issues: Run `chmod +x mvnw` if needed.
- Docker Issues: Restart Docker and retry `docker compose up`.
