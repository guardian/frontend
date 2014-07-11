package com.gu.integration.test.features

import org.openqa.selenium.WebDriver

import com.gu.integration.test.FrontsSeleniumTestSuite

class ArticleTests extends FrontsSeleniumTestSuite {
  
  feature("Articles") { 
    scenarioWeb("checking most popular module exists") { implicit driver: WebDriver =>
      val articlePage = ArticleSteps().goToArticle("/technology/2014/jul/10/emergency-surveillance-laws-rushed-through-cross-party-support")
      ArticleSteps().checkMostPopularModuleExistsOn(articlePage)
    }
  }
}
