package com.gu.discussion.page

import com.gu.automation.support.{TestLogger, Wait}
import org.openqa.selenium.support.ui.{ExpectedConditions, Select}
import org.openqa.selenium.{By, WebDriver}

case class CommentModule(implicit driver: WebDriver, logger: TestLogger) {

  private val startComments = driver.findElement(By.cssSelector(".d-discussion .d-discussion__pagination .pagination"))
  private def showMoreFeaturedCommeLink = driver.findElement(By.className("show-more__container--featured"))
  private def showAllCommentsButton = driver.findElement(By.className("d-discussion__show-all-comments"))
  private def commentTextArea = driver.findElement(By.className("d-comment-box__body"))
  private def postYourCommentButton = driver.findElement(By.className("d-comment-box__submit"))
  private def cancelButton = driver.findElement(By.className("d-comment-box__cancel"))
  private def sortOrderControl = driver.findElement(By.cssSelector(".discussion__comments > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > select:nth-child(1)"))
  private def nextPageControl = startComments.findElement(By.cssSelector(".pagination__item--next .pagination__item-inner"))
  private def previousPageControl = startComments.findElement(By.cssSelector(".pagination__item--prev .pagination__item-inner"))
  private def firstPageControl = startComments.findElement(By.cssSelector(".pagination__item--first .pagination__item-inner"))
  private def lastPageControl = startComments.findElement(By.cssSelector(".pagination__item--last .pagination__item-inner"))
  private def showMoreRepliesButton = driver.findElement(By.className("d-show-more-replies"))

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

  def addNewComment(): CommentModule = {
    commentTextArea.sendKeys("This is a test comment - lorem ipsum dolor sit amet")
    this
  }

  def postNewComment(): CommentModule = {
    postYourCommentButton.click()

    //Ugly hack to wait for URL to change
    var retries = 10
    while (!driver.getCurrentUrl().contains("#comment-") || retries < 0) {
      Thread.sleep(500)
      retries = retries - 1
    }

    val errorMsg = driver.findElement(By.cssSelector(".d-discussion__error-text"))

    if (errorMsg.isDisplayed()) {
      System.err.println("Sorry, there was a problem posting your comment.")
    } else {
    }
    this
  }

  /*def postNewComment(): CommentModule = {
    postYourCommentButton.click()

    //Ugly hack to wait for URL to change
    var retries = 10
    while (!driver.getCurrentUrl().contains("#comment-") || retries < 0) {
      Thread.sleep(500)
      retries = retries - 1
    }
    this
  }*/

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
    Wait().until(ExpectedConditions.presenceOfElementLocated(By.cssSelector(".discussion__comments__container .preload-msg.d-discussion__loader.u-h")))
  }

}
