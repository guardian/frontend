package com.gu.discussion.page

import com.gu.automation.support.{TestLogging, LoggingIn, Config}
import com.gu.automation.support.page.PageCompanion
import com.gu.discussion.support.ByExt
import org.openqa.selenium.{By, WebDriver}
import org.scalatest.Matchers

case class ArticlePage(implicit driver: WebDriver) extends Matchers with TestLogging {

  private def commentCountLabel = driver findElement By.cssSelector("div.content__main-column.content__main-column--article div.js-comment-count a.js-show-discussion")
  private def showAllCommentsLink = driver findElement ByExt.dataLinkName("View all comments")

  def goToStartOfComments(): ArticlePage = {

    if (commentCountLabel.isDisplayed) {

      commentCountLabel.click()
    } else {
      logger.error("There are no comments for this article!")
    }
    this
  }

  def showAllComments(): ArticlePage = {
    showAllCommentsLink.click()
    this
  }

}

object ArticlePage extends PageCompanion[ArticlePage] {

  override val relativeUrl = Config().getUserValue("testArticlePath")

  override def makePage(implicit driver: WebDriver) = ArticlePage()

}


