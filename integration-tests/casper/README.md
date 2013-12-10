# Casper JS Tests
*Headless functional tests using [Casper JS](http://casperjs.org/testing.html)*

To run all tests
``grunt test:integration``

To override default host (`http://localhost:9000/`) set an your bash env variable ```ENVIRONMENT``` to mirror the stage you want to test:
``ENVIRONMENT=prod grunt test:integration``

To run individual specs
``grunt test:integration:discussion``

If you add a new test file, add a corresponding grunt task for it under `casperjs` in `Gruntfile.js`
