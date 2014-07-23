package com.gu.integration.test.features

import com.gu.automation.support.TestLogging
import org.openqa.selenium.WebDriver
import com.gu.integration.test.pages.article.ArticlePage
import com.gu.fronts.integration.test.PageLoader._
import org.scalatest.Matchers
import com.gu.integration.test.pages.common.AdvertiseModule

case class ArticleSteps(implicit driver: WebDriver) extends TestLogging with Matchers {

  def goToArticle(relativeArticleUrl: String): ArticlePage = {
    logger.step(s"I am an Article page with relative url: $relativeArticleUrl")
    lazy val article = new ArticlePage()
    goTo(fromRelativeUrl(relativeArticleUrl), article)
  }

  def checkMostPopularDisplayedProperly(articlePage: ArticlePage) = {
    logger.step("Get most popular module and check that it is properly displayed")
    articlePage.mostPopularModule.displayedLinks should not be empty
    articlePage.mostPopularModule.displayedImages should not be empty
  }

  def checkMostRelatedContentDisplayedProperly(articlePage: ArticlePage) = {
    logger.step("Get related content module and check that it is properly displayed")
    articlePage.relatedContentModule.displayedLinks should not be empty
    articlePage.relatedContentModule.displayedImages should not be empty
  }

  def checkThatTopBannerAdIsDisplayedProperly(articlePage: ArticlePage) = {
    logger.step("Check that top banner ad is displayed on the page")
    checkThatAdWithIFrameIsDisplayedProperly(articlePage.topBannerAdModule)
  }

  def checkThatAdToTheRightIsDisplayedProperly(articlePage: ArticlePage) = {
    logger.step("Check that right hand ad is displayed on the page")
    checkThatAdWithIFrameIsDisplayedProperly(articlePage.rightHandAdModule)
  }

  private def checkThatAdWithIFrameIsDisplayedProperly(adModule: AdvertiseModule) = {
    adModule.adLabel.isDisplayed should be(true)
    val adIFrame = adModule.advertiseIFrameContent
    adIFrame.displayedLinks should not be empty
    adIFrame.displayedImages should not be empty
    //this is neccessary in order to switch back to the main frame
    driver.switchTo().defaultContent()
  }
}
