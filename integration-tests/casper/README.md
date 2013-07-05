# Casper JS Tests
*Headless functional tests using [Casper JS](http://casperjs.org/testing.html)*

To run all tests
``grunt test:integration``

To override default host (`http://localhost:9000/`)
``grunt test:integration --host=http://m.gucode.co.uk/``

To run individual specs
``grunt casper:discussion``

If you add a new test file, add a corresponding grunt task for it under `casper` in `Gruntfile.js`
