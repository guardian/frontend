package com.gu.integration.test.features

import com.gu.integration.test.features.util.IntegrationSeleniumTestSuite
import com.gu.integration.test.steps.{ArticleSteps, DiscussionSteps}
import com.gu.integration.test.tags.ReadyForProd
import org.openqa.selenium.WebDriver

class DiscussionTests extends IntegrationSeleniumTestSuite {
  
  feature("Discussion") { 
    scenarioWeb("checking that the discussion module is properly loaded", ReadyForProd) { implicit driver: WebDriver =>
      val articlePage = ArticleSteps().goToArticle("/politics/2014/jul/01/michael-gove-lord-harris")
      DiscussionSteps().checkDiscussionContentIsProperlyLoaded(articlePage.commentsContainerModule())
    }
  }
}