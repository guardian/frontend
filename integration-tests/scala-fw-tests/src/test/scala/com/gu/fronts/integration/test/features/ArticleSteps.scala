package com.gu.fronts.integration.test.features;

import com.gu.automation.support.TestLogging
import org.openqa.selenium.WebDriver
import com.gu.fronts.integration.test.PageHelper
import com.gu.fronts.integration.test.page.nwfront.ArticlePage

case class ArticleSteps(implicit driver: WebDriver) extends TestLogging with PageHelper {

  def goToArticle(relativeArticleUrl: String): ArticlePage = {
    logger.step("I am an Article page with relative url: " + relativeArticleUrl)
    lazy val article = new ArticlePage()
    val articlePage = goTo(fromRelativeUrl(relativeArticleUrl), article)
    articlePage
  }
  
  def checkMostPopularModuleExistsOn(articlePage: ArticlePage) = {
    logger.step("Get most popular module and check that it is displayed")
    articlePage.mostPopularModule()
  }

}
