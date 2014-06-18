Purpose
=======
The purpose of this module is to create integration and functional tests which test the frontend UI applications as black box using Selenium Webdriver.

The goals are as following:

* Have a limited number of tests which follows a journey through the different page(s). In other words, not many small tests as that both opens and closes a lot of windows which makes the test suite(s) run slowly and also make it difficult to see what overall user story/journey a particular test is actually testing.
* The tests should be self-contained, meaning there should be as little as possible, preferably, no external dependencies and the tests should be able to run in any environment (assuming the prerequisites are met). There is an exception to this, see below.
* The tests should not be fragile. This is partly achieved by the point above, of having the tests self contained, and by using Selenium best practices such as using test specific attributes on the rendered HTML and rely on the DOM structure as little as possible (as that changes a lot)
* The tests should run fast. That is both subjective and relative as Selenium based tests can never be as fast as API tests. That is why there should be a limited number of tests which should test a journey rather than just a specific function or UI element.

To achieve this goal the following architecture is proposed. For sake of simplicity all Frontend apps are simply called Fronts.

![alt tag](https://raw.githubusercontent.com/guardian/frontend/java-selenium-test/integration-tests/java-selenium/docs/Fronts%20testing%20overview.png)
