package com.gu.integration.test.features

import org.openqa.selenium.WebDriver
import com.gu.integration.test.SeleniumTestSuite
import com.gu.integration.test.tags.ReadyForProd

class ArticleTests extends SeleniumTestSuite {

  feature("Articles") {
    scenarioWeb("checking most popular module and related content exist on article page", ReadyForProd) {
      implicit driver: WebDriver =>
        val articlePage = ArticleSteps().goToArticle("/world/2014/jul/13/voodoo-big-problem-haiti-cardinal-chibly-langlois")
        ArticleSteps().checkMostPopularDisplayedProperly(articlePage)
        ArticleSteps().checkMostRelatedContentDisplayedProperly(articlePage)
    }
  }
}