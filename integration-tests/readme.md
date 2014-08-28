## Overview

This is an SBT multi-module test project with independent test module which share a common module.

It consists of the following modules.

* common-test-lib - this is a common library for the test modules and contains common Page Objects, super classes and various utility classes
* frontend-tests - Contains integration tests which are common for the whole front end and thus not specific for any particular front-end module. Keep in mind that tests here are currently configured to break the delivery flow of front end. For more details see its readme file
* identity-tests - Contains test cases related to login, create users etc. For more details see it's readme.

The modules are configured both under project/Build.scala and, for each module, under identity-tests/build.sbt and frontend-tests/build.sbt.

## Best practices and guide lines

Writing new tests is fairly simple and follow these steps:

* Create your test classes under src/test/scala/com.gu.integration.test... and then:
* Name it XXXTests where XXX is the feature you are trying to test
* Make it extend the proper super class which sets the local configuration file location. For an example see IntegrationSeleniumTestSuite class
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
* Create, or extend existing, PageObjects for representing pages, and parts of pages. They should be put in common-test-lib if they are to be shared between test modules or otherwise in a specific test module. For example:  ```src/main/scala/com.gu.integration.test.pages.XXX``` where XXX is the page group. 
* Page Objects shall extend ParentPage and define an implicit driver: WebDriver in its constructor argument list. See ```ArticlePage``` for an example.
* Page Objects shall declare page elements at the top of the file. Use def for elements which should be lazy loaded and val for elements which should be eagerly loaded whenever a page is loaded.
* Despite the name Page Objects should NOT represent an entire page. It should be appropriately modularised into modules with suffix Module and should be navigated from their parent page. See ```ArticlePage.mostPopularModule``` and MostPopularModule for an example.
* Make sure that a Page Object does not exist before creating a new one.
* When finding new elements it is strongly ENCOURAGED to tag those elements with data-test-id="some-value" e.g. data-test-id="article-root"
* It is strongly DISCOURAGED to use existing DOM elements and structure. This is a sure way to create flaky tests.
* ElementLoader contains various useful helper methods for dealing with WebElements. Please look at it before implementing a potential duplicate method.
* NEVER have dependencies between test cases. Each test should be completely independent of each other as they may run in any order and in parallel.
