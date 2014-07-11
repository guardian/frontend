package com.gu.integration.test.features

import org.openqa.selenium.WebDriver

import com.gu.integration.test.SeleniumTestSuite

class ArticleTests extends SeleniumTestSuite {
  
  feature("Articles") { 
    scenarioWeb("checking most popular module exists") { implicit driver: WebDriver =>
      val articlePage = ArticleSteps().goToArticle("/technology/2014/jul/10/emergency-surveillance-laws-rushed-through-cross-party-support")
      ArticleSteps().checkMostPopularModuleExistsOn(articlePage)
    }
  }
}
