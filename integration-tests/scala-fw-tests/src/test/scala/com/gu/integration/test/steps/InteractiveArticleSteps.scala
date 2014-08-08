package com.gu.integration.test.steps

import org.openqa.selenium.WebDriver
import org.scalatest.Matchers
import com.gu.automation.support.TestLogging
import com.gu.integration.test.util.PageLoader._
import com.gu.integration.test.util.ElementLoader._
import com.gu.integration.test.pages.article.LiveBlogPage
import com.gu.integration.test.pages.article.InteractiveArticlePage

case class InteractiveArticleSteps(implicit driver: WebDriver) extends TestLogging with Matchers {

  def goToInteractiveArticle(relativeLiveArticleUrl: String): InteractiveArticlePage = {
    logger.step(s"I am an Interactive Article page with relative url: $relativeLiveArticleUrl")
    lazy val interactiveArticle = new InteractiveArticlePage()
    goTo(interactiveArticle, fromRelativeUrl(relativeLiveArticleUrl))
  }

  def checkInteractiveContentBodyIsDisplayedProperly(interactiveArticle: InteractiveArticlePage) = {
    logger.step("Check interactive article content body is displayed properly")
    interactiveArticle.contentBodyIFrame().displayedImages.size should be > (2)
  }
}
