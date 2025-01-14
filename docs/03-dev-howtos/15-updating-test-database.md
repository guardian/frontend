# Updating the test database

## Background
In order to run integration tests without requiring a network connection, frontend creates a local database of external HTTP requests which is used in place of a regular network client when running tests

## Updating test database
If you are making or updating an external HTTP request (such as a CAPI query) in your test, for example where you are using the `TestRequest` object, you will need to:
* Run all tests locally. This will make a network request and modify files in the local test database.
* Add and commit new and modified database files. These will have file names like: `data/database/014ed94831df96eeb792a6c22eda60432bb346c77dc6899328c6447faba6246c`
* Check the tests pass in CI

## Troubleshooting
* When running your test locally you may get an HTTP error due to the vagaries of the network, try re-running the failing tests using `test-quick`.
* If you get many test failures locally, try removing any local `devOverrides` as they may interfere with the config expected by the tests.
* If you get an error in CI such as [`Data file has not been checked in`](https://github.com/guardian/frontend/blob/ac973840ccbbbce33a956feb7ef0a3b612c50d71/common/test/recorder/HttpRecorder.scala#L43),
  check you have committed files in the `/data/database` folder.
