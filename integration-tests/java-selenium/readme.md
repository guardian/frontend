Introduction
============
The purpose of this module is to create integration and functional tests which test the frontend UI applications as black box using Selenium Webdriver. The main focus point of the test will initially be Facia "backed" pages/applications. Meaning those that are rendered based on pressed.json which is produced and retrieved from Amazon Web Service.

The goals are as following:

* Have a limited number of tests which follows a journey through the different page(s). In other words, not many small tests as that both opens and closes a lot of windows which makes the test suite(s) run slowly and also make it difficult to see what overall user story/journey a particular test is actually testing.
* The tests should be self-contained, meaning there should be as little as possible, preferably, no external dependencies and the tests should be able to run in any environment (assuming the prerequisites are met). There is an exception to this, see below.
* The tests should not be fragile. This is partly achieved by the point above, of having the tests self contained, and by using Selenium best practices such as using test specific attributes on the rendered HTML and rely on the DOM structure as little as possible (as that changes a lot)
* The tests should run fast. That is both subjective and relative as Selenium based tests can never be as fast as API tests. That is why there should be a limited number of tests which should test a journey rather than just a specific function or UI element.
* A separate test suite will be run periodically against the PROD environment and is a live environment in the sense that nothing is stubbed. This is for tests specifically made for a live PROD environment.


To achieve these goal the following architecture is proposed. For sake of simplicity all Frontend apps are simply called Fronts.

![](https://raw.githubusercontent.com/guardian/frontend/java-selenium-test/integration-tests/java-selenium/docs/Fronts%20testing%20overview.png)

The green elements is to illustrate that when running the tests that is the elements used and requests being made. For example, normally the pressed.json is retrieved from AWS, but for the test the configuration needs to be changed to instead point to the Wiremock Http server.

For user tracking towards Ophan and Omnitracking the initial proposal is, for the tests, to simply setup Wiremock proxies which will intercept all requests made from the browser. However for the future, to have the tests more self contained, it might be benifical to create proper Wiremock endpoints to replace the user tracking services.

How to run
===========

Prerequisites
-------------
* Java 7 (will not work with Java 8)
* Maven 3 (might work with Maven 2)
* Firefox 26+
* OS - Should work in Windows 7, Linux Ubuntu/Mint and Mac OS, assuming other prerequities are met). For Mac OS X make sure that you have JAVA_HOME property set to a Java 7 installation, otherwise Maven may not pick it up properly, even if you have it installed. E.g. add "export JAVA_HOME="/usr”” to your .bash_profile"

Before running the tests, the fronts application needs to be successfully started, for example by executing (from frontend root): 
```
./sbt 'project dev-build' start 
```

Also you need to make sure that your /etc/gu/install_vars has the value STAGE=TEST


It has been tested on Linux Mint 17, Open JDK 7, Maven 3 and Firefox 26.

Running the tests
-----------------
Simply change to the root of this frontend and execute
```
cd integration-tests/java-selenium/
mvn clean verify
```
