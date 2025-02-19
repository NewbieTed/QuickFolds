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
