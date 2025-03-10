# Developer Guide

This is the developer Guide, and contains implementation details about the state of the repository, things that go beyond just running the current version. It is expected you have also read the USERMANUAL to be able to run the build.

## Table of Contents

- [How to obtain the source code](#how-to-obtain-the-source-code)
- [Layout of Directory Structure](#layout-of-directory-structure)
  - [/Backend](#backend)
  - [/Frontend](#frontend)
  - [/reports](#reports)
- [How to build the software](#how-to-build-the-software)
- [How to test the software](#how-to-test-the-software)
  - [Frontend](#frontend-1)
  - [Backend](#backend-1)
- [How to add a new test](#how-to-add-a-new-test)
  - [Frontend](#frontend-2)
  - [Backend](#backend-2)
- [How to build a release](#how-to-build-a-release)

## How to obtain the source code

This project only has one repository.

You can clone the repository at:

```
https://github.com/NewbieTed/QuickFolds
```

There is only one repository with all the code. Standard git clone.


## Layout of Directory Structure

We have three main folders where contents should go:

### /Backend

This is where all the content that involves the backend part of our system (handling API requests and connecting to the database), holding all source files and backend tests.

Here is an overview of what each folder inside backend does:

+ /database: store the database schema
+ /env: Store all the enviroment variables
+ /setup: stores bash scripts that build and run the backend system
+ /src: contains the source code for backend
  - /main: holds all the springboot code to interact with database and handles API calls. Follows a standard Spring boot structure
  - /test: holds all the testing fildes for backend

### /Frontend

This is where all the content that involves the frontend part of our system (handling the community board client webcode, interacting with and calculating the editor operations such as folding and annotating), holding all source files and frontend tests.

Here is an overview of what each folder inside frontend does:

+ /community: holds all the code related to the community board
+ /paper: holds all the code with the editor
  + controller: this is a module of code that is responsible for telling all the other modules to update to the correct state. This involves the Rendering, 2D frontend version of storage locally, 3D rendering version of the paper, and the backend system to store it
  + /geometry: holds general "math" related content such as points and faces objects
  + /model: hodls the 2D frontend version of storage locally. Also deals with doing splitting
  + /view: The user interaction component of editor: both in terms of getting user input and rendering the planes.

+ /unit_test: holds all mocha tests for frontend




### /reports

This holds the weekly reports for our teams for the 403 staff to read.


## How to build the software.

To build the software, run the `bash` script in `backend/setup` to build and run the system for backend, and `npx vite` for frontend. See the USER Manual.

Below is a bit more detail about our tools:

For frontend, we build our webpage with `Vite` and Node Package Manager to build and run our code. Vite has support for Three.js, which is a library to run our 3d rendered objects.

For backend, we use Docker to store our database, and spring boot to recieve API requests.

You can do `docker compose up` to start a docker container

and

`mvn clean install` and `mvn spring-boot:run` to activate spring boot.




## How to test the software

Once your code has been build (see how to build in the User Manual):

__Frontend:__

To run frontend tests, go to `frontend/unit_test/general` and run
```
bash localtester.sh
```
 to run the frontend tests.


__Backend:__

To only run backend tests, go to `backend/` run the following command in the terminal:

```
./mvnw test
```


## How to add a new test

__Frontend:__

UNIT TESTING DIRECTORY

Create subdirectories structured the same as the frontend folder structure
itself and put corresponding unit test files here. E.g. to unit test geometry classes
we would have 'unit_test/paper/geometry/<test files here>'.


---


TESTING LOCALLY

While Github actions will run the unit tests, it's best to run them
locally before you merge.
All local scripts are in the general/ folder


To lint your TS code do the following:

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

__NOTE:__ Please follow casing/conventions establish in the `example.test.ts` file.

---

__BACKEND:__

TESTING DIRECTORY

Test folder structure should mimic the main folder structure and
all unit test files must be named FileNameTest.java,
and all integration test files must be named FileNameIT.java.

Ex: the unit tests for the UserMapper that has a file path of
main\java\com\quickfolds\backend\user\mapper
should be in a file called UserMapperTest.java and have a file path of
test\java\com\quickfolds\backend\user\mapper.

To run tests: cd into Quickfolds/backend and use 'mvn test' for unit tests
or 'mvn verify' for unit tests and integration tests

---

NOTE ON EXAMPLE TESTS AND FOR TAS:
The process of determining how to test backend has become a very research and
experimentation heavy one that will require more time.
As such, a verifiably correct example test does not yet exist.
All work on backend testing is currently being done in the backend-testsetup branch.

### How to build a release


Fortnuately, building a release follows the same structure as the current build steps.

Simply follow the same way you've done as before, assuming there is a version with the provided bash scripts.

If not, you will have to manually run the commands inside the bash scripts that we provide.
