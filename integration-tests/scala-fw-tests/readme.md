Introduction
============
The purpose of this module is to run a series of specialised tests against the live/production environment. The thought is that being able to know that something is broken in production should then stop you from deploying new functionality until the problem has been fixed. This is achieved by running the integration tests as part of the build chain in CI (TeamCity) and if they fail should prevent a build being able to complete. However there should by a bypass option so that you can deploy a fix.

So to reiterate the requirements for these tests:
* They shall target live/production environment
* They shall run as part of the normal build chain and prevent a deployment to production if the tests fails
* There shall be a workaround to deploy a fix to prod, despite the tests failing

Workflow
===========
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

------>

![Alt text](doc/build_mute_test_2.png?raw=true "Build chain with tests failing")

Then when doing a successive build, with the muted test, it will then be successful and look like this:

![Alt text](doc/build_chain_success_muted.png?raw=true "Build chain with tests muted")

This will allow you to deploy the fix to prod. Remember though to unmute it, using similar procedure, once the fix has been applied so the test  can then be (hopefully) successfuly run.

Writing tests
=================

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
* If the test is to run against production then you need to add the tag ```ReadyForProd```. For example:
```
scenarioWeb("checking most popular module and related content exist on article page", ReadyForProd) {
```
* ONLY do this if you are sure that this test does not depend on things that is likely to change in production. Not doing that is a sure way to create flaky tests.
* NEVER have dependencies between test cases. Each test should be completely independent of each other as they may run in any order and in parallel.

Running the Tests
=================
To run the tests you can either load the project in your favourite IDE as an SBT project and then simply run it as a ScalaTest class or you can run it in command line by simply exeuting: ```sbt test```

If you want to run the same test suite which TeamCity runs then execute: ```sbt ciTest```. This will only run the tests with tag ReadyForProd and will not fail the build if the tests fail.

Configuring the tests
=====================
Configuration is done in two places.
* src/main/resources/project.conf - This is a file which is checked in Git and contain various default values and are normally not changed.
* /local.conf (meaning at the root of this project) - This file contains values which are personal for you, such as user name and passwords, and will not be checked into Git as it is in .gitignore. These have an override mechanism for overriding property values found in project.conf. As this is a framework configuration then please see [Guardian Scala Test Automation FW](https://github.com/guardian/scala-automation) for detailed info for how this works.
An example can look like this:
```
"environment" : "sauceLabs" //this will make sure that the sauceLabs object below is picked up. Change to local to not use sauceLabs
"testBaseUrl" : "http://localhost:9000" //This is the root url of the application and should ONLY be found in configuration
"sauceLabs":{
	"webDriverRemoteUrl" : "http://guardian-shahin:XXXd@ondemand.saucelabs.com:80/wd/hub"
}
```
