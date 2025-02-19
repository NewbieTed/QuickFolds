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

5. To open the editor and use it properly, we first need to create an origami on the community board. Note that this means backend should be up and running docker + mvn. If you don't have these set up, you can still see these webpages, it's just that they will error halfway through when you do an action since it connects to backend in the middle of the action. To see the community board, type in `http:/localhost:PORT_NUMBER_HERE/frontend/community/communityboard.html`. If backend is set up, you can create a new origami from here, and then run the editor and perform actions. If you want to go the editor directly (this will cause problems in backend interactions), go to `http:/localhost:PORT_NUMBER_HERE/frontend/paper/view/origami_editor/editor.html`

6. The editor/community board should appear and you should be good to go


#### Editor Settings

Here are the current things you can do in the editor when looking around

+ Pressing Left Mouse Button: Let's You rotate the camera around a center point

+ Pressing Left Mouse Button + Pressing Shift: Allows you to move the point/camera itself in space

+ Pressing 'p': hides the center point the camera rotates from

+ Presssing 'r': resets the rotating point back to origin

Here are the list of actions you can do to create actions:

+ create point. Click the 'create point' button, then click again on the plane to add the point.

+ delete point. Click the 'delete point' button, then click again near the point you want to delete. The closest point (do not try to delete a vertex) will be deleted.

+ add annotation line. Click the 'add line' button. You will now click the mouse button twice. Each click should be for each of the points in your new line. For example, say I want to add a new line between points A and B. I would click 'add line', then click my mouse near point A, then near point B, and then a new line is created and the action is done.

+ delete annotation line. Click the 'delete line' button. You will now click the mouse button twice. Each click should be for each of the points of the line you want to remove. For example, say I want to remove the line between points A and B. I would click 'delete line', then click my mouse near point A, then near point B, and then the line connecting them is deleted.

__Note: the user interaction is quite finnicky, if you don't follow the steps exactly, the operation will crash. This will absolutely be updated in the future. However, right now, we just want to esablish a connection between frontend and backend, and to show that our complex architecture works.__

### Testing Frontend

UNIT TESTING DIRECTORY

Create subdirectories structured the same as the frontend folder structure
itself and put corresponding unit test files here. E.g. to unit test geometry classes
we would have 'unit_test/paper/geometry/<test files here>'.


========================================================================================


TESTING LOCALLY

While Github actions will run both the all unit tests, it's best to run this
locally before you merge.
All local scripts are in the general/ folder


To lint your TS code (if desired to check for typing stuff, not required/checked in CI) do the following:

+ run `npm install` to download GTS, a linter for TS code [do only the first time if not recent]
+ go to the `frontend\unit_test\general` folder in your terminal. For windows user, try git bash.
+ run `bash locallinter.sh`

This should lint for all TS files locally.


To run your TS testing code do the following:

+ create a FILE_NAME.test.ts file to test your code. I have created an example test file under general/example.test.ts
+ run `npm install` to download GTS, a linter for TS code [do only the first time if not recent]
+ go to the `frontend\unit_test\general` folder in your terminal. For windows user, try git bash.
+ run `bash localtester.sh`

This should run for all *.test.ts files locally under unit_test.

## Backend

### Prerequisites
Ensure you have the following installed:

1. Java Development Kit (JDK 21+), to install, run:
    ```sh
    brew install openjdk@21
    echo 'export PATH="/opt/homebrew/opt/openjdk@21/bin:$PATH"' >> ~/.zshrc
    source ~/.zshrc
   ```

2. Maven (If not using the provided `mvnw` script; any `mvn` and `mvnw` comands are interchangable), to install, run:
    ```sh
    brew install maven
    ```

3. PostgreSQL (if using a local database, NOT RECOMMENDED)
    ```sh
    brew install postgresql
    brew services start postgresql
    ```

4. Docker (if using `docker-compose` for database setup)
   Download and install Docker Desktop from:
   [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### Setup

#### Environment variables

Environmental variables are contained in an env.zip file that will not be added to the remote repository due to containing sensitive information.

Unzip the file and put the resulting folder into the backend root folder Quickfolds/backend. This folder should contain two other folders: a folder env that contains the .env files and a _MACOSX file for Macs.

#### Loading environment variables:

Mac:
In order to get the backend running, environment variables is required as they serve as credentials to the database. However, given that such data is sensitive, they cannot be pushed to git. Therefore, it is **required** to manually configure the environment variables.

To configure the environment variables, first run the following command in the terminal under the file path `QuickFolds/backend/env` to create a env file:
   ```sh
   vim <your_file_name>.env  # Edit as needed
   ```
Then, add the following environment variables to the env file you just created by writing into the editor:
```text
    LOCAL_DB_HOST=<your_localhost_name>
    LOCAL_DB_PORT=<your_port_number>
    LOCAL_DB_NAME=<your_local_db_name>

    LOCAL_DB_USER=<your_local_user_name>
    LOCAL_DB_PASSWORD=<your_local_db_password>

    JWT_SECRET=<your_jwt_secret_key>
```
After writing the environment files, quit vim by entering `:wq`.

To load the environment variables, navigate back to `QuickFolds/backend`, and load the environment variables by running the following command in terminal:
   ```sh
   export $(grep -v '^#' env/<your_file_name>.env | xargs) # Edit as needed
  ```
If you need the environment files, please email the team members.

Windows (**highly not recommended**): run the following script in the terminal:
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
- Using Docker, run the following in the terminal:
  ```sh
  docker compose up
  ```
- Using Local PostgreSQL, run the following in the terminal:
  ```sh
  psql -U postgres -c "CREATE DATABASE mydb;"
  ```

#### Build and Run the Application

To build the environment, run the following in the terminal:
   ```sh
   ./mvnw clean install
   java -jar target/backend-0.0.1-SNAPSHOT.jar
   ```
   Or to start the localhost, run the following in the terminal:
   ```sh
   ./mvnw spring-boot:run
   ```
   To only run tests, run the following in the terminal:
   ```sh
   ./mvnw test
   ```

#### Database Migrations
Execute the schema SQL file in `<Quickfolds/backend/database>`.


#### Connecting with Frontend to run Editor

To properly run the editor, you need to set up "dummy data" in our database.

This intro data contains the types of possible steps, and a created user account.

Run

`Reset_Dummy_Data.sql`

on the database to get it set up.

This should allow you to create an origami, and then edit it.

Note: the internal system saves user accounts with account ids.

If you cannot connect to the editor, this may be why.

To see what id the admin account has.

Run:

`GetAliceId.sql` to get the created admin account id, then set the `USER_ID` variable equal to this result in communityboard.ts under frontend/community.

This most likely should not need.
(most standard system start with our inputted id, but it could techinally happen).

#### Troubleshooting
- Port Conflicts: Ensure `8080` and `5432` are available.
- Permissions Issues: Run `chmod +x mvnw` if needed.
- Docker Issues: Restart Docker and retry `docker compose up`.
