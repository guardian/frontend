## Table of Contents

* [Introduction](#introduction)
* [How to write a test (quick)](#how-to-write-a-test-quick)
* [How to prepare to run the tests against a local installation](#how-to-prepare-to-run-the-tests-against-a-local-installation)
* [Configuring the tests](#configuring-the-tests)
* [Running the Tests](#running-the-tests)
* [Workflow (detailed)](#workflow-detailed)
* [Writing tests (detailed)](#writing-tests-detailed)

## Introduction

The purpose of this module is to run a series of specialised tests against the live/production environment. The thought is that being able to know that something is broken in production should then stop you from deploying new functionality until the problem has been fixed. This is achieved by running the integration tests as part of the build chain in CI (TeamCity) and if they fail should prevent a build being able to complete. However there should by a bypass option so that you can deploy a fix.

So to reiterate the requirements for these tests:
* They shall target live/production environment
* They shall run as part of the normal build chain and prevent a deployment to production if the tests fails
* There shall be a workaround to deploy a fix to prod, despite the tests failing

Furthermore, at the time when this readme was written, the tests in this module target these two areas:
* Content and modules which are asynchronously loaded by AJAX
* Content and modules related to advertisting

The reason for this is that other aspects of the applications can be tested by lower level tests such as component tests using HtmlUnit and JavaScript tests. Those are preferred to these tests as they are quicker.

## How to write a test (quick)

This section will quickly go through the steps to write a new test. It is strongly recommended to read this entire readme, as it contains a lot of useful information, however if you need to write a test quickly. Follow these steps:

* Put your test class under ```src/test/scala/com.gu.integration.test.features``` (or extend an existing class if you find a suitable one)
* Write your test using XXXSteps and Page Objects (see below sections for details)
* Add ```data-test-id``` attributes to elements which your test are targetting. (see ```ElementLoader``` class for helper methods)
* Do a dry run of your test on a local dev-build instance to make sure it works
* Create a pull request and merge it into master, using existing process for code change
* Deploy your changes to PROD, using existing process. This is to make sure that the data-test-id attributes are deployed in prod
* Once in prod, run a dry run of your test locally but this time target PROD and not local dev-build
* Once you are confident that your test is working, against PROD, add ScalaTest tag ```ReadyForProd``` like this:
```
scenarioWeb("making sure that X is working", ReadyForProd) {
...
```
Only do this if you are sure that the test does not depend on things that are likely to change in PROD. That will make the whole test suite flaky
* Create a pull request and merge into master. The test will now be picked up by the TeamCity build process

## How to prepare to run the tests against a local installation

The main target of these tests are to target a production instance. However, for various reasons such as developing or debugging tests, it is sometimes beneficial to run the test against a local dev-prod instance. So below are steps needed, on top of the steps to run a local dev-build instance as explained on the root readme:

* Set the property: ```facia.stage=PROD```
* Make sure the advertising modules are turned on. Get help from a member of the commercial frontend team if you dont know how to do this.
* Make sure that the discussion module is pointing to the prod discussion API. A way to do that is to copy the ```discussion.XXX``` properties from ```frontend/common/conf/env/PROD.properties``` to your local frontend property override file.

That should be it. Start the server on dev-build and you are ready to configure and run the tests.

## Configuring the tests

Configuration of the test module can be done in two places.
* ```src/main/resources/project.conf``` - This is a file which is checked in Git and contain various default values and are normally not changed unless it is to be changed for everyone running the tests.
* ```/local.conf``` (meaning at the root of this project) - This file contains values which are personal for you, such as user name and passwords, and will not be checked into Git as it is in .gitignore. These have an override mechanism for overriding property values found in project.conf. As this is a framework configuration then please see [Guardian Scala Test Automation FW](https://github.com/guardian/scala-automation) for detailed info for how this works.
* 
An example of local.conf can look like this:
```
"environment" : "browserStack" //this will make the values in the browserstack object to be picked up. Change to local if you want to target a local dev-build instance
"testBaseUrl" : "http://localhost:9000" //this will target a local dev-build instance. Comment out to target prod
"sauceLabs":{
	"webDriverRemoteUrl" : "http://guardian-shahin:XXX@ondemand.saucelabs.com:80/wd/hub"
}
"browserStack":{
	"webDriverRemoteUrl" : "http://shahinkordasti1:XXX@hub.browserstack.com/wd/hub"
}
```

## Running the Tests

To run the tests you can either load the project in your favourite IDE as an SBT project and then simply run it as a ScalaTest class or you can run it in command line by simply exeuting: ```sbt test```

If you want to run the same test suite which TeamCity runs then execute: ```sbt ciTest```. This will only run the tests with tag ```ReadyForProd``` and will not fail the build if the tests fail.


## Workflow (detailed)

The fundamental difficulty with tests running against live (post deploy) in a build chain of artifacts that are going to live (pre deploy) is that the tests are not verifying the artifacts, which it is build together with, but rather against artifacts which are already in production.

This effectively means that any test failure which are seen are from a previous deployment, rather than the deployment for which it is built together with. And since that is a requirement it creates a somewhat un-intuitive work flow for when running builds and fixing test.

Below is a screenshot of the proposed build chain configuration in Team City with tests passing.

![Alt text](doc/build_chain_success.png?raw=true "Build chain with tests passing")

In this example one application, article-clone (which could be any application), is shown together with root-clone and the integration-test module. As can be seen article-clone depends on both of these and this means that both of them will build and need to be successful before article-clone build can be done. This also means that integration-test and root-clone can be run in parallel which means that the integration-test build will not add any extra time to the existing builds, prior to integration-test being introduced.

If integration-test fails, however, things will look like this:

![Alt text](doc/build_chain_fail.png?raw=true "Build chain with tests failing")

Observe that integration-test failing has resulted in article-clone, automatically failing (it does not even build), but root-clone was still successfully built. This will effectively prevent article-clone from being deployed as the artifact to be deployed is not properly created.

So assume now that a fix is done and needs to be built and deployed. Now since the integration-test will NOT be able to run against the fix until AFTER it has been built and deployed, the test failure needs to somehow be bypassed. And how to do that, in TeamCity, is by muting test failure(s).
To do this, go to the build, with the test failure in question, and mute it. The two following screenshots illustrate how this can be done:

![Alt text](doc/build_mute_test_1.png?raw=true "Build chain with tests failing")

--------------------------------------------------------------------------------------------

![Alt text](doc/build_mute_test_2.png?raw=true "Build chain with tests failing")

Then when doing a successive build, with the muted test, it will then be successful and look like this:

![Alt text](doc/build_chain_success_muted.png?raw=true "Build chain with tests muted")

This will allow you to deploy the fix to prod. Remember though to unmute it, using similar procedure, once the fix has been applied so the test  can then be (hopefully) successfuly run.

## Writing tests (detailed)

Writing new tests is fairly simple and follow these steps:

* Create your test classes under src/test/scala/com.gu.integration.test.features and then: 
* Name it XXXTests where XXX is the feature you are trying to test
* Make it extend SeleniumTestSuite
* Define your test cases, inside your test class, like this: 
```
  feature("Articles") { 
    scenarioWeb("checking most popular module and related content exist on article page") { implicit driver: WebDriver =>
      val articlePage = ArticleSteps().goToArticle("/world/2014/jul/13/voodoo-big-problem-haiti-cardinal-chibly-langlois")
      ArticleSteps().checkMostPopularDisplayedProperly(articlePage)
      ArticleSteps().checkMostRelatedContentDisplayedProperly(articlePage)
    }
  }
```
* Make sure to name your feature and scenarioWeb appropriately
* Dont forget the ```implicit driver: WebDriver =>```
* The body of the test method should only show a short overview of what the test does and basically delegate everything to XXXSteps classes see ```ArticleSteps``` for an example. Step classes in turn should delegate page specific operations, such as clicking on links etc, to Page Objects.
* For navigating to pages use the PageLoader.goTo and PageLoader.fromRelativeUrl, if you are going to a relative url (which is the case in most situations, see Configuration below).
* Create, or extend existing, PageObjects for representing pages, and parts of pages. They should be put under ```src/main/scala/com.gu.integration.test.pages.XXX``` where XXX is the page group. 
* Page objects shall extend ParentPage and define an implicit driver: WebDriver in its constructor argument list. See ```ArticlePage``` for an example.
* Despite the name Page Objects should NOT represent an entire page. It should be appropriately modularised into modules with suffix Module and should be navigated from their parent page. See ```ArticlePage.mostPopularModule``` and MostPopularModule for an example.
* Make sure that a Page Object does not exist before creating a new one.
* When finding new elements it is strongly ENCOURAGED to tag those elements with data-test-id="some-value" e.g. data-test-id="article-root"
* It is strongly DISCOURAGED to use existing DOM elements and structure. This is a sure way to create flaky tests.
* ElementLoader contains various useful helper methods for dealing with WebElements. Please look at it before implementing a potential duplicate method.
* If the test is to run continously in TeamCity then you need to add the tag ```ReadyForProd```. For example:
```
scenarioWeb("checking most popular module and related content exist on article page", ReadyForProd) {
```
* ONLY do this if you are sure that this test does not depend on things that is likely to change in production. Not doing that is a sure way to create flaky tests.
* NEVER have dependencies between test cases. Each test should be completely independent of each other as they may run in any order and in parallel.
