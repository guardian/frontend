package com.gu.integration.test.features

import com.gu.automation.support.TestRetries
import com.gu.integration.test.features.util.IntegrationSeleniumTestSuite
import com.gu.integration.test.steps.ArticleSteps
import com.gu.integration.test.tags.ReadyForProd
import org.openqa.selenium.WebDriver

class CommercialTests extends IntegrationSeleniumTestSuite {
  
  feature("Commercial") { 
    scenarioWeb("checking ad slots are properly displayed on a specific article page", ReadyForProd) { implicit driver: WebDriver =>
      val articlePage = ArticleSteps().goToArticle("/politics/2014/jul/01/michael-gove-lord-harris")
      ArticleSteps().checkThatTopBannerAdIsDisplayedProperly(articlePage)
      ArticleSteps().checkThatAdToTheRightIsDisplayedProperly(articlePage)
      ArticleSteps().checkThatInlineAdIsDisplayedProperly(articlePage)
    }
  }
}