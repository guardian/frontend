package com.gu.integration.test.features

import com.gu.automation.support.TestRetries
import com.gu.integration.test.features.util.IntegrationSeleniumTestSuite
import com.gu.integration.test.steps.{ArticleSteps, InteractiveArticleSteps, LiveBlogSteps}
import com.gu.integration.test.tags.ReadyForProd
import org.openqa.selenium.WebDriver

class ArticleTests extends IntegrationSeleniumTestSuite {

  feature("Articles") {
    scenarioWeb("checking most popular module exist on standard article page", ReadyForProd) {
      implicit driver: WebDriver =>
        val articlePage = ArticleSteps().goToArticle("/world/2014/jul/13/voodoo-big-problem-haiti-cardinal-chibly-langlois")
        ArticleSteps().checkMostPopularDisplayedProperly(articlePage)
    }

    scenarioWeb("checking that async content such as expand button and Popular in.. works properly on live blog page", ReadyForProd) {
      implicit driver: WebDriver =>
        val liveBlogPage = LiveBlogSteps().goToLiveBlog("/world/2014/jul/22/gaza-crisis-john-kerry-and-ban-ki-moon-step-up-attempts-to-broker-ceasefire-live-updates")
        LiveBlogSteps().checkPopularInContentIsDisplayedProperly(liveBlogPage)
        LiveBlogSteps().openExpandSection(liveBlogPage)
        LiveBlogSteps().checkExpandedSectionContent(liveBlogPage)
    }

    scenarioWeb("checking that interactive article page is pulling in async content properly", ReadyForProd) {
      implicit driver: WebDriver =>
        val liveBlogPage = InteractiveArticleSteps().goToInteractiveArticle("/global-development/ng-interactive/2014/jul/24/girl-summit-aspirations-interactive")
        InteractiveArticleSteps().checkInteractiveContentBodyIsDisplayedProperly(liveBlogPage)
    }
  }
}