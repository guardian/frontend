package com.gu.integration.test.features

import com.gu.automation.support.TestLogging
import org.openqa.selenium.WebDriver
import com.gu.integration.test.pages.article.ArticlePage
import com.gu.fronts.integration.test.PageLoader._

case class ArticleSteps(implicit driver: WebDriver) extends TestLogging {

  def goToArticle(relativeArticleUrl: String): ArticlePage = {
    logger.step("I am an Article page with relative url: " + relativeArticleUrl)
    lazy val article = new ArticlePage()
    goTo(fromRelativeUrl(relativeArticleUrl), article)
  }

  def checkMostPopularModuleExistsOn(articlePage: ArticlePage) = {
    logger.step("Get most popular module and check that it is displayed")
    articlePage.mostPopularModule()
  }
}
