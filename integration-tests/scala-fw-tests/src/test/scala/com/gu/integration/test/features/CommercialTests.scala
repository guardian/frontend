package com.gu.integration.test.features

import org.openqa.selenium.WebDriver
import com.gu.integration.test.SeleniumTestSuite
import com.gu.integration.test.tags.ReadyForProd

class CommercialTests extends SeleniumTestSuite {
  
  feature("Commercial") { 
    scenarioWeb("checking ad slots are properly displayed on a specific article page", ReadyForProd) { implicit driver: WebDriver =>
      val articlePage = ArticleSteps().goToArticle("/politics/2014/jul/01/michael-gove-lord-harris")
      ArticleSteps().checkThatTopBannerAdIsDisplayedProperly(articlePage)
      ArticleSteps().checkThatAdToTheRightIsDisplayedProperly(articlePage)
      ArticleSteps().checkThatInlineAdIsDisplayedProperly(articlePage)
    }
  }
}