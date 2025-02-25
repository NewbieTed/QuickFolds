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

### How to install the software

This project requires the following prerequisites:
+ Env Files
+ Node.js
+ JDK 21
+ Docker Desktop: Personal Edition
+ Maven
+ Windows Subsystem for Linux [Windows Users Only]
+ Homebrew [Mac Users Only]


### Where to download Prereqs:

#### Env files

This project contains enviroment variables that store sensetive information from password info. Please email a member on the team for a copy of these files.

The folder, once gotten, is in the following structure:

```
/env
  L _MACOSX
  L local.env
  L dev.env
  L test.env
  L prod.env
```

Please replace the current `backend/env` folder with this new content. It should look like

```
/backend
  L/env
    L _MACOSX
    L local.env
    L dev.env
    L test.env
    L prod.env
```


#### Node.js

Download for correct OS from this website `https://nodejs.org/en/download`. Follow the installer.

#### JDK 21

Download JDK 21 for the correct OS from this website `https://www.oracle.com/java/technologies/javase/jdk21-archive-downloads.html`. Follow the installer.

#### Docker Desktop

Download for correct OS from this website `https://www.docker.com/products/docker-desktop/`. The free version, "Personal", is fine. Follow the installer.

#### Maven
Download for correct OS from this website
`https://maven.apache.org/download.cgi`.
Not thate


For mac users, the DMG installer should set up for you.

For windows user, you have to set it up manually. After uncompressing the downloaded zip file:

1) Add the bin directory of the created directory `apache-maven\bin` to the MAVEN_HOME system environment variable. It should look something like `MAVEN_HOME=C:\Program Files\Apache\Maven\apache-maven-<version>\bin` (or more generally, wherever you put your Maven folder at)

2) Confirm that mvn is set up with `mvn -version` in your powershell terminal


#### Windows Subsystem for Linux

If you are a windows user, you will need access to specific maven commands only found on linux and mac terminals. We will user Windows Subsystem for Linux (WSL) to do this.

1) Go to your powershell terminal, and type `wsl --install`

2) WSL is set up, but we need the other tools to be aware WSL was made. Open the Docker Desktop.

3) Click on the settings on the top right of your screen

4) Click on `Resources`, then `WSL Integration`

5) Click on `Enable integration with my default WSL distro`, if not already active

5) Enable the `Ubuntu` distro, if not already active

6) Click apply and restart. You may have to open a new WSL termial to apply the changes.
 ---
### How to Run QuickFolds

We need to activate both frontend server and backend server to use the editor/community board.
#### Frontend - Being able to go to the HTML webpages with Rendering

1. Go to your terminal, __from the root project directory__, and type  `npx vite`, this creates a local host server that renders any Three.js code

2. If sucessful, you should see `VITE vX.X.XX ready...`

3. Below the message in 2., you should see text saying `Local: http:/localhost:PORT_NUMBER_HERE/`, this is where your localhost is running (usually 5173)

4. Pressing this url should result in `This localhost page can’t be found`. _THIS IS INTENDED_. Vite is looking for a index.html file (the "base file" in any web server). However, with multiple people working on this at once, we won't do this [and it's also good practice]. Instead, you can access the file you want putting the directory path`http:/localhost:PORT_NUMBER_HERE/PATH.html`

5. To open the editor, type in `http:/localhost:PORT_NUMBER_HERE/frontend/community/communityboard.html`.

6. The editor should appear and you should be good to go, although you can't create any new orgiami, as we have to start up backend now.

7. To stop frontend, type `ctrl + c`

 ---
#### Backend - Being able to create the database and set up support for saving creations


To Start up backend, we have unique steps for the different OS:

#### Windows:

__NOTE: If at any point you have trouble, there is a manual step by step guide at the very bottom on this README on how to activate backend. However, these steps should work.__


1) Open up a __WSL__ terminal, and go to the current project directory. Most IDEs should do this automatically for you if you click of the plus button in the terminal sections (VScode does for example).

2) Go to the `backend/setup` directory. You should see a bunch of bash scripts you can run.

3) If there has been an update, you want to do a "clean reset" of the entire backend setup, or you are opening a new WSL terminal session, run `source startupbackendwindows.sh`

4) If sucessful, this creates the database on Docker, and fills it with the startup information, and preps Maven to be able to be launched.

5) Now, from your terminal, run `mvn spring-boot:run`. It may take a while to run. However, you will know it's sucessful if it doesn't stop running [note: maven also displays the message `ACCEPTING INCOMING TRAFFIC` at the very end if sucessful].

6) Backend is now set up. You will have to refresh the frontend webpage (just refresh your browser, no need to restart Vite)

7) If you every want to reset the contents of the data (ie clear all the saved origami), run the bash script `source resetdatabase.sh`

7) Once you're done with backend, stop the running script by goint `ctrl + c`. Then run the script `stopallbackendactions.sh`. This should deactivate any running docker and maven processess.

 ---

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

+ _Mocha_ - a library used for Unit testing


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
