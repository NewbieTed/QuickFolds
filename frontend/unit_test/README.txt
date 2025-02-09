UNIT TESTING DIRECTORY

Create subdirectories structured the same as the frontend folder structure
itself and put corresponding unit test files here. E.g. to unit test geometry classes
we would have 'unit_test/paper/geometry/<test files here>'.





TESTING LOCALLY

While Github actions will run both the TS linter and all unit tests, it's best to run them
locally before you merge.
All local scripts are in the general/ folder


To lint your TS code do the following:

+ run `npm install` to download GTS, a linter for TS code
+ go to the `frontend\unit_test\general` folder in your terminal. For windows user, try git bash.
+ run `bash locallinter.sh`

This should lint for all TS files locally.