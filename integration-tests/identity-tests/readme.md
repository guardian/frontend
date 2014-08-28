## Introduction

The purpose of this module is to run a series of tests related to logging in/out and user management use cases. It is currently targetted to run against the next-gen CODE environment.

This document contains information specific for this module. For more general info see the parent readme file.

## How to write a test (quick)

This section will quickly go through the steps to write a new test. It is strongly recommended to also read the parent readme, as it contains a lot of useful information, however if you need to write a test quickly. Follow these steps:

* Put your test class under ```src/test/scala/com.gu.identity.integration.test.features```
* Make it extend IdentitySeleniumTestSuite
* Write your test using XXXSteps and Page Objects (see below sections for details)
* Create a pull request and merge it into master, using existing process for code change. If you are adding data-test-id attributes, which you should, then make a separate pull request to have it merged into master and deployed to CODE.
* Deploy your changes to CODE, using existing process.
* Once the data-test-id attributes are deployed to CODE, run a dry run of your test
* Once you are confident that your test is working, against CODE, create a pull request and merge it into master

## How to prepare to run the tests against a local installation

The main target of these tests are to target a CODE instance. However, for various reasons such as developing or debugging tests, it is sometimes beneficial to run the test against a local dev-prod instance.

However, at the time of writing this document, there was no easy way to successfully run identity tests in a local environment since it requires a working identity back end instance, running locally. However, I have been told, that this is possible.

## Configuring the tests

Configuration of the test module is done in two places.
* ```src/main/resources/project.conf``` - This is a file which is checked in Git and contain various default values and are normally not changed unless it is to be changed for everyone running the tests.
* ```/local.conf``` (meaning at the root of this project) - This file contains values which are sensitive and as such cannot be checked into Git. Ask your QA representative for a copy of this file.
* 
An example of local.conf can look like this:
```
"environment" : "local"

"browsers":[{"name": "chrome", "version": "35"}, {"name": "firefox", "version": "30"}]

"browserStack":{
  "webDriverRemoteUrl" : "http://shahinkordasti1:XXX@hub.browserstack.com/wd/hub"
}

"sauceLabs":{
  "platform" : "Windows 7" //use https://saucelabs.com/platforms to set this value
  "browserEnvironment" : "sauceLabs"
  "webDriverRemoteUrl" : "http://guardian-shahin:XXX@ondemand.saucelabs.com:80/wd/hub"
}

"loginEmail": "someemail@guardian.co.uk"
"loginPassword": "some password"
"user" : {
  "loginName": "someusername"
  "faceBookEmail" : "somefacebook@email.com"
  "faceBookPwd" : "somepassword"
  "faceBookLoginName" : "Some Testguy"
  "googleEmail": "some.google@guardian.co.uk"
  "googlePwd": "somepassword"
  "googleLoginName": "SOme Testguy"
}
```

Observe the environment value. This indicates that the tests will be executed from a local browser instance and is useful when developing tests.

Also observe that Chrome is set as a target browser. When running tests locally, this will only work if you set the path to a Chrome Driver like this:
```
System.setProperty("webdriver.chrome.driver", "/home/<username>/Downloads/chromedriver")
```
Keep in mind though that, at the time of writing this tests, they were not properly working in Chrome due to this issue:

https://code.google.com/p/selenium/issues/detail?id=2766

## Running the Tests

To run the tests you can either load the project in your favourite IDE as an SBT project and then simply run it as a ScalaTest class or you can run it in command line by, going to the parent integration-test folder, and simply exeuting: ```sbt "project identity-tests" clean compile test```

If you want to run the same test suite which TeamCity runs then execute: ```sbt ciTest```. This is for the CI environment and will not fail the build if the tests fail. This is so the tests can be properly muted in Team City.

However, at the time of writing this document, the tests cannot be properly run due to an environment (id.code.dev...) not being accessable from BrowserStack/SauceLab environments.
