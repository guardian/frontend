package com.gu.discussion.page

import com.gu.automation.support.TestLogger
import com.gu.automation.support.page.Element._
import com.gu.automation.support.page.{Element, Wait}
import org.openqa.selenium.support.ui.{ExpectedConditions, Select}
import org.openqa.selenium.WebDriver
import org.openqa.selenium.By._

case class CommentModule(implicit driver: WebDriver, logger: TestLogger) {

  private val startOfComments = driver findElement cssSelector(".d-discussion .d-discussion__pagination .pagination")
  private def showMoreFeaturedCommeLink = driver element className("show-more__container--featured")
  private def showAllCommentsButton = driver element className("d-discussion__show-all-comments")
  private def commentTextArea = driver element className("d-comment-box__body")
  private def postYourCommentButton = driver element className("d-comment-box__submit")
  private def cancelButton = driver element className("d-comment-box__cancel")
  private def sortOrderControl = driver element cssSelector(".discussion__comments > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > select:nth-child(1)")
  private def nextPageControl = startOfComments findElement cssSelector(".pagination__item--next " +
    ".pagination__item-inner")
  private def previousPageControl = startOfComments findElement cssSelector(".pagination__item--prev .pagination__item-inner")
  private def firstPageControl = startOfComments findElement cssSelector(".pagination__item--first .pagination__item-inner")
  private def lastPageControl = startOfComments findElement cssSelector(".pagination__item--last .pagination__item-inner")
  private def showMoreRepliesButton = driver element className("d-show-more-replies")
  private def commentsLoading = driver element cssSelector(".discussion__comments__container .preload-msg.d-discussion__loader.u-h")

  def showAllReplies(): CommentModule = {
    showMoreRepliesButton.click()
    this
  }

  def showMoreFeaturedComments(): CommentModule = {
    showMoreFeaturedCommeLink.click()
    this
  }

  def sortOrderComments(): CommentModule = {
    new Select(sortOrderControl).selectByVisibleText("oldest")
    this
  }

  def addNewComment(newCommentText :String): CommentModule = {
    commentTextArea.sendKeys(newCommentText)
    this
  }

  def postNewComment(): CommentModule = {
    postYourCommentButton.click()

    //Ugly hack to wait for URL to change
    var retries = 10
    while (!driver.getCurrentUrl().contains("#comment-") && retries > 0) {
      Thread.sleep(500)
      retries = retries - 1
    }
    this
  }

  def cancelNewComment(): CommentModule = {
    cancelButton.click()
    this
  }

  def showAllComments(): CommentModule = {
    showAllCommentsButton.click()
    this
  }

  def sortCommentsByOrder(): CommentModule = {
    new Select(sortOrderControl).selectByVisibleText("oldest")
    logger.info("loading Sort order by Oldest")
    this
  }

  def gotoNextPage(): CommentModule = {
    logger.info("loading Next page")
    nextPageControl.click()
    waitForCommentsToLoad()
    this
  }

  def gotoPreviousPage(): CommentModule = {
    logger.info("loading Previous page")
    previousPageControl.click()
    waitForCommentsToLoad()
    this
  }

  def gotofirstPage(): CommentModule = {
    logger.info("loading First page")
    firstPageControl.click()
    waitForCommentsToLoad()
    this
  }

  def gotoLastPage(): CommentModule = {
    logger.info("loading Last page")
    lastPageControl.click()
    waitForCommentsToLoad()
    this
  }

  def waitForCommentsToLoad() = {
    //Need this wait for the page to reload/refresh which is actioned with javascript
    commentsLoading.waitGet()
  }

}
