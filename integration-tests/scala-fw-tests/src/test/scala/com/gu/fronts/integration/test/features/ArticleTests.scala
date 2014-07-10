package com.gu.fronts.integration.test.features;

import com.gu.fronts.integration.test.FrontsSeleniumTestSuite;

class ArticleTests extends FrontsSeleniumTestSuite {
  
  feature("Articles") {
    scenarioWeb("checking most popular module exists") {
      val articlePage = ArticleSteps().goToArticle("/technology/2014/jul/10/emergency-surveillance-laws-rushed-through-cross-party-support")
      ArticleSteps().checkMostPopularModuleExistsOn(articlePage)
    }
  }
}
