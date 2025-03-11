# QuickFolds

## Overview

### Where to find
Go to the beta++ tag in the Quickfolds Repository:


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
+ dos2unix Dependency for WSL [Windows User only]
+ JDK 21/Maven on WSL [Windows User Only]
+ Homebrew [Mac Users Only]


run final command in /backend



### Where to download Prereqs:

#### Env files

This project contains enviroment variables that store sensetive information from password info. Please email a member on the team for a copy of these files.

The folder, once gotten, is in the following structure:

```
/env
  L local.env
  L dev.env
  L test.env
  L prod.env
```

Please replace the current `backend/env` folder with this new content. It should look like

```
/backend
  L/env
    L local.env
    L dev.env
    L test.env
    L prod.env
```


#### Node.js

Download for correct OS from this website `https://nodejs.org/en/download`. Follow the installer.

#### JDK 21

Download JDK 21

For Windows: from this website `https://www.oracle.com/java/technologies/javase/jdk21-archive-downloads.html`. Follow the installer.

For Mac: Run in terminal
```
brew install openjdk@21
echo 'export PATH="/opt/homebrew/opt/openjdk@21/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

#### Docker Desktop

Download for correct OS from this website `https://www.docker.com/products/docker-desktop/`. The free version, "Personal", is fine. Follow the installer.

#### Maven
Download for correct OS from this website
`https://maven.apache.org/download.cgi`.
Not thate

For Mac Users:

    ```sh
    brew install maven
    ```

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

#### dos2unix Dependency for WSL [Windows User only]

To run backend, we will have to run a bunch of bash scripts on WSL. However, there is a problem doing this.

Whenever windows opens a file, such as through and IDE for example, windows will convert the file to follow windows encoding. Inspecifc, it likes to add a `\t` at the end of every line. This is a problem as linux doesn't do this.

dos2unix is a package that allows us to delete this `\t` if it's added (generally it happens whenever you open the file up).


To download this, go to your WSL terminal and type

```
sudo apt install dos2unix
```

####  JDK 21/Maven for WSL [Windows User only]

We may also need to download JSD 21 and Maven for WSL (as you can think of this as a mini virtual computer).

You may need to download JDK and Mavne on WSL to.

Run

```
sudo apt install openjdk-21-jdk -y
sudo apt install maven -y

```
If WSL cannot find JDK or MAVEN when running the steps.


#### Homebrew

Mac users will need homebrew to install the other tools.

Most macs should come with this (if you've ever used the `brew` command, you have homebrew)

Check to see if you have homebrew by running
```
brew --version
```

If not, run:
```
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```
To download it.

 ---

### How to Run QuickFolds

We need to activate both frontend server and backend server to use the editor/community board.
#### Frontend - Being able to go to the HTML webpages with Rendering

1. Go to your terminal, __from the root project directory__, and type  `npx vite`, this creates a local host server that renders any Three.js code

2. If sucessful, you should see `VITE vX.X.XX ready...`

3. Below the message in 2., you should see text saying `Local: http:/localhost:PORT_NUMBER_HERE/`, this is where your localhost is running (usually 5173)

4. Pressing this url should result in `This localhost page can’t be found`. _THIS IS INTENDED_. Vite is looking for a index.html file (the "base file" in any web server). However, with multiple people working on this at once, we won't do this [and it's also good practice]. Instead, you can access the file you want putting the directory path`http:/localhost:PORT_NUMBER_HERE/PATH.html`

5. To open the editor, type in `http://localhost:PORT_NUMBER_HERE/frontend/user/login.html`.

6. The editor should appear and you should be good to go. Create an account and log in, then you will be taken to the community board and can create your own origami.

7. To stop frontend, type `ctrl + c`

 ---

#### Backend - Being able to create the database and set up support for saving creations


To Start up backend locally, we have unique steps for the different OS:

__Note: if you want to run the application on the website. Go to "http:quickfolds.org", if online, and follow the same
log in/sign up steps as as below under how to use this softare. Sign up/in, go to community board, click new or clickon an origami from there.__

#### Windows:

__NOTE: If at any point you have trouble, there is a manual step by step guide at the very bottom on this README on how to activate backend. However, these steps should work.__

0) Open up the Docker Desktop, and keep the application open the entire time you use it.

1) Open up a __WSL__ terminal, and go to the current project directory. Most IDEs should do this automatically for you if you click of the plus button in the terminal sections (VScode does for example).

2) Go to the `backend/setup` directory. You should see a bunch of bash scripts you can run.

3) If there has been an update, you want to do a "clean reset" of the entire backend setup, or you are opening a new WSL terminal session, run `source startupbackendwindows.sh`. __Note: If you see an error for any bash script you run that says something like `$'..\r': No such file or directory`, Windows has added the Windows-only encoding format where they add a `\r` at the end of every line. This occurs whenever you open the file outside of WSL (this includes IDEs). To fix this, run `dos2unix filename.sh` and it will be fixed until it gets applied again if you open it.__

4) If sucessful, this creates the database on Docker, and fills it with the startup information, and preps Maven to be able to be launched, and launches it. You will know it's sucessfull if it doesn't stop running [note: maven also displays the message `ACCEPTING INCOMING TRAFFIC` at the very end if sucessful].


6) Backend is now set up. You will have to refresh the frontend webpage (just refresh your browser, no need to restart Vite)

7) If you every want to reset the contents of the data (ie clear all the saved origami), run the bash script `source resetdatabase.sh`

8) Once you're done with backend, stop the running script by goint `ctrl + c`. Then run the script `stopallbackendactions.sh`. This should deactivate any running docker and maven processess.

 ---

 #### Mac:

0) Open up the Docker Desktop, and keep the application open the entire time you use it.

1) Go to the `backend/setup` directory.

2) If there has been an update, you want to do a "clean reset" of the entire backend setup, or you are opening a new WSL terminal session, run `chmod +x startupbackendmac.sh`. Then do `./startupbackendmac.sh`

4) If sucessful, this creates the database on Docker, and fills it with the startup information, and preps Maven to be able to be launched, and launches it. You will know it's sucessfull if it doesn't stop running [note: maven also displays the message `ACCEPTING INCOMING TRAFFIC` at the very end if sucessful].

6) Backend is now set up. You will have to refresh the frontend webpage (just refresh your browser, no need to restart Vite)

7) If you every want to reset the contents of the data (ie clear all the saved origami), run the bash script `chmod +x resetdatabase.sh`. Then do `./resetdatabase.sh`

8) Once you're done with backend, stop the running script by goint `ctrl + c`. Then run the script `chmod +x stopallbackendactions.sh`, then do `chmod +x stopallbackendactions.sh`. This should deactivate any running docker and maven processess.

### How to use the software

#### Login

You are able to create accounts and sign in. This must be done before creating a new origami.

#### Community board

The community board is a place where user can see created origami, and can opt to create their own origmai.

Currently, the community board will load all public origami, and has the ability to create an origami. In the future, you can search for specific origami [not yet implemented].

To create your own origami, click the new origami button at the top right and provide your name for it.

You will be taken to the editor to create it.


 #### Editor

The editor is a place where you can edit your origami.

Here are the current things you can do to navigate the editor:

+ Pressing Left Mouse Button: Let's You rotate the camera around a center point

+ Pressing Left Mouse Button + Pressing Shift: Allows you to move the point/camera itself in space

+ Pressing 'p': hides the center point the camera rotates from

+ Presssing 'r': resets the rotating point back to origin

+ Pressing 'c': swpas between a perspectie and orthographic camera

+ Use the mouse scroll wheel to zoom in and out.

Here are the current actions you can do in the editor:

Currently users have the ability to create "annotations." These are marks on the paper that
can be helped for aligning folds [folds aren't available to users yet, as they're only halfway implemented].

User can create points and lines. Annotation points are a point on the piece of paper. An annotation line is a line on the graph that can create a fold, if the points are on the edge of the paper [not yet implemented].


+ Create Annotation Point: Click the "add annotation point" button, then click the a point on the plane, a line will be made there.

+ Delete Annotation Point: Click the "delete annotation point" button, then click near the point you want to delete. The nearest point will be deleted, asumming it is not apart of an annotation line (a hanging point, as we call it)

+ Add Annotation Line: Click the "add annotation line" button, then click the 2 nearest points, or vertex, you want to make as the line segments to your new point.

+ Delete Annotation Line: Click the "delete annotation line" button, the click the 2 nearest point, or vertex, you want to remove the annotation line from.

+ Fold Button: You can create a new foldcl. To do this, you click the two points on the face you want to cut in half, a line will now appear, you then click the point of the face that should stay stationary during the rotation. After this, you then pick an angle, where positive values corresponding to the "upper" part of the face moving closer together, then provide the amount in degrees that should rotate. Keep in mind all paper stacked together in a group will be fold.

### Known bugs

+ Community Board Doesn't have search bar working [this isn't implemented yet]

+ If you are in the middle of one button action in the editor, then swap to another, it crashes. For example, say I click "Add Point", then I click "Delete Point", it breaks.

+ Error Creating annotation line to connect two vertex. This is intended, but we don't notify the user and allow them to continue.



### Report and issue to the Project

Please go to the `https://github.com/NewbieTed/QuickFolds/issues` to report an issue.

We have loose guides for reporting an issue.

Here is the desired structure:

```
Title: Few Words About Issue

Description: A more details description (~3-6 sentences) about what is problem is

Web browser: Provide which browser you are on (ex: Google Chrome)

Concrete Steps to Produce the Bug:

1. Step 1 to see bug
2. Step 2 to see the bug
...
```

For general guidence on writing good reports, see: `https://bugzilla.mozilla.org/page.cgi?id=bug-writing.html`
and `https://www.browserstack.com/guide/how-to-write-a-bug-report`.

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




---

# MANUAL FOR TROUBLING SHOOTING SETTING UP REPOSITORY

# Backend Installation

Guide for all things backend

# Set up

The current backend structure is set up for
Here is the structure to set up backend for _windows_ users:

## Step 1: Set up env files

The first thing to do is to add all of the env files.
These contain all the usernames and passwords for all the backend services. For obvious reasons, we haven't put these files in the respository. Please email one of the current dev team members to get these files.

For windows users, we need to add the proper enviroment variables for these env files:

Run this command

`
Get-ChildItem -Path "path\to\env" -Filter "*.env" | ForEach-Object { Get-Content $_ | ForEach-Object { if ($_ -notmatch "^\s*#|^\s*$") { $parts = $_ -split '=', 2; [System.Environment]::SetEnvironmentVariable($parts[0].Trim(), $parts[1].Trim(), "Process") } } }
`

For most people, the backend path should be `".\backend\env"`

## Step 2: add docker

Download docker for windows:
https://www.docker.com/products/docker-desktop/

Docker is used to build, test, and deploy our application within an isolated "containers" that package an application with all its dependencies.

Unfortnately, windows doesn't have direct support for docker, so we need to set up support to the commands:

First is to download wsl (windows subservice for linux):
think of it like a mini linux kernel to run commands, such as docker, that aren't native to PowerShell.

+ **ON POWERSHELL RUN**:
`
wsl --install
`

This will not work with other terminals on windows, it needs to be the native one.

Now we need to install the acutal distribution of linux:
Install a Linux distribution (e.g., Ubuntu) from the Microsoft Store:

+ Open the Microsoft Store and search for “Ubuntu” (or your preferred Linux distribution) and install it.


Now we need docker to connect to wsl:

+ Open Docker Desktop, go to Settings → General → Enable WSL 2.
+ Make sure to enable the option for "Use the WSL 2 based engine."

+ Click Apply & Restart on docker to apply changes

Now we can set up docker with our project:

Open up a WSL terminal (NOT POWERSHELL):

If you open up a WSL terminal directly via the windows search bar, WSL will start at the root. We need to go to the quickfolds project folder (wherever you have saved it).

+ Note: Most IDEs let you specify the type of terminal you want to open [VSCode is a good example of this], you can click the `v` button to selected a specific terminal.

+ Note: you can tell it's wsl terminal with user@host:~$

Now we run our commands:


+ run `docker --version`. This should return a version (use this as a test to make sure docker is connected)
You should see docker on you

+ run docker compose


Set up Maven:

We use maven as a build automation tool for managing and building Java projects.


To set up maven on this, follow this tutorial: https://phoenixnap.com/kb/install-maven-windows

From your terminal, run:

+ `mvn clean install`

+ `mvn spring-boot:run`

Congrats! you build is done.

# Testing
To start the tests for the backend, run:

+ `mvn clean test`

And the test should automatically run



