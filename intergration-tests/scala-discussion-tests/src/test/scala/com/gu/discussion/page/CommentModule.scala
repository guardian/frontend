package com.gu.discussion.page

import com.gu.automation.support.TestLogger
import com.gu.automation.support.page.Element
import org.openqa.selenium.By._
import org.openqa.selenium.WebDriver
import org.openqa.selenium.support.ui.Select
import Element._

case class CommentModule(implicit driver: WebDriver, logger: TestLogger) extends Support {

  private val latestComment = driver findElement cssSelector(".discussion__comments__container .d-comment")
  private val startOfComments = driver findElement cssSelector(".d-discussion .d-discussion__pagination .pagination")
  private def showMoreFeaturedCommeLink = driver findElement className("show-more__container--featured")
  private def showAllCommentsButton = driver findElement className("d-discussion__show-all-comments")
  private def commentTextArea = driver findElement className("d-comment-box__body")
  private def postYourCommentButton = driver findElement className("d-comment-box__submit")
  private def cancelButton = driver findElement className("d-comment-box__cancel")
  private def sortOrderControl = driver findElement cssSelector(".discussion__comments > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > select:nth-child(1)")
  private def nextPageControl = startOfComments findElement cssSelector(".pagination__item--next " +
    ".pagination__item-inner")
  private def previousPageControl = startOfComments findElement cssSelector(".pagination__item--prev .pagination__item-inner")
  private def firstPageControl = startOfComments findElement cssSelector(".pagination__item--first .pagination__item-inner")
  private def lastPageControl = startOfComments findElement cssSelector(".pagination__item--last .pagination__item-inner")
  private def showMoreRepliesButton = driver findElement className("d-show-more-replies")
  private def commentsLoading = driver findElement cssSelector(".discussion__comments__container .preload-msg.d-discussion__loader.u-h")

  def getLatestComment(): CommentItem = {
    CommentItem(latestComment)
  }

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

  def addNewComment(newCommentText: String): CommentModule = {
    commentTextArea.sendKeys(newCommentText)
    this
  }

  def postNewComment(): CommentItem = {
    postYourCommentButton.click()
    waitForNewCommentItem
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
    waitGet(commentsLoading)
  }

}


