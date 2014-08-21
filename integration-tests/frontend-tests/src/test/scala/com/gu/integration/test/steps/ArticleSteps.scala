package com.gu.integration.test.steps

import com.gu.automation.support.TestLogging
import org.openqa.selenium.WebDriver
import com.gu.integration.test.pages.article.ArticlePage
import com.gu.integration.test.util.PageLoader._
import org.scalatest.Matchers
import com.gu.integration.test.pages.common.AdvertiseModule

case class ArticleSteps(implicit driver: WebDriver) extends TestLogging with Matchers {

  def goToArticle(relativeArticleUrl: String): ArticlePage = {
    logger.step(s"I am an Article page with relative url: $relativeArticleUrl")
    lazy val article = new ArticlePage()
    goTo(article, fromRelativeUrl(relativeArticleUrl))
  }

  def checkMostPopularDisplayedProperly(articlePage: ArticlePage) = {
    logger.step("Get most popular module and check that it is properly displayed")
    val mostPopularModule = articlePage.mostPopularModule()
    mostPopularModule.displayedLinks(3).size should be (3)
    mostPopularModule.displayedImages should not be empty
  }

  def checkThatTopBannerAdIsDisplayedProperly(articlePage: ArticlePage) = {
    logger.step("Check that top banner ad is displayed on the page")
    checkThatAdWithIFrameIsDisplayedProperly(articlePage.topBannerAdModule())
  }

  def checkThatAdToTheRightIsDisplayedProperly(articlePage: ArticlePage) = {
    logger.step("Check that right hand ad is displayed on the page")
    checkThatAdWithIFrameIsDisplayedProperly(articlePage.rightHandAdModule())
  }

  def checkThatInlineAdIsDisplayedProperly(articlePage: ArticlePage) = {
    logger.step("Check that inline ad is displayed on the page")
    checkThatAdWithIFrameIsDisplayedProperly(articlePage.inlineAdModule())
  }

  def checkThatBottomMerchandisingAdIsDisplayedProperly(articlePage: ArticlePage) = {
    //observe that this ad location is UK only so wont work when browser is from outside UK, such as SauceLabs etc
    logger.step("Check that bottom merchandising ad is displayed on the page")
    val bottomMerchandisingAd = articlePage.bottomMerchandisingAdModule()
    bottomMerchandisingAd.adLabel.isDisplayed should be (true)
    bottomMerchandisingAd.displayedLinks() should not be empty
    bottomMerchandisingAd.displayedImages should not be empty
  }

  private def checkThatAdWithIFrameIsDisplayedProperly(adModule: AdvertiseModule) = {
    adModule.adLabel.isDisplayed should be(true)
    val adIFrame = adModule.advertiseIFrameModule()
    adIFrame.displayedLink.isDisplayed should be (true)
    adIFrame.displayedImages should not be empty
    
    //this is neccessary in order to switch back to the main frame
    adIFrame.dispose()
  }
}
