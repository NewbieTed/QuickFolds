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

==================================================================================

NOTE ON EXAMPLE TESTS AND FOR TAS:
The process of determining how to test backend has become a very research and
experimentation heavy one that will require more time.
As such, a verifiably correct example test does not yet exist.
All work on backend testing is currently being done in the backend-testsetup branch.