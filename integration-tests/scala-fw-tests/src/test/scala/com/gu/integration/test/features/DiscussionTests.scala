package com.gu.integration.test.features

import org.openqa.selenium.WebDriver
import com.gu.integration.test.SeleniumTestSuite
import com.gu.integration.test.tags.ReadyForProd
import com.gu.integration.test.steps.ArticleSteps
import com.gu.integration.test.steps.DiscussionSteps

class DiscussionTests extends SeleniumTestSuite {
  
  feature("Discussion") { 
    scenarioWeb("checking that the discussion module is properly loaded") { implicit driver: WebDriver =>
      val articlePage = ArticleSteps().goToArticle("/politics/2014/jul/01/michael-gove-lord-harris")
      DiscussionSteps().checkDiscussionContentIsProperlyLoaded(articlePage.commentsContainerModule)
    }
  }
}