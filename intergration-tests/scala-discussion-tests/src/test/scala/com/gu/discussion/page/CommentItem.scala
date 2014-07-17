package com.gu.discussion.page

import com.gu.automation.support.Config
import org.openqa.selenium.support.ui.Select
import org.openqa.selenium.{WebElement, WebDriver}
import org.openqa.selenium.By._

case class CommentItem(commentRoot: WebElement)(implicit driver: WebDriver) extends Support {

  private def showCommentButton = commentRoot findElement  className("d-comment-box__show-parent")
  private def replyToCommentButton = commentRoot findElement  className("d-comment__action--reply")
  private def commentTextArea = commentRoot findElement  cssSelector("textarea[name=\"body\"]")
  private def postReplyButton = commentRoot findElement  className("d-comment-box__submit")
  private def cancelReplyButton = commentRoot findElement  className("d-comment-box__cancel")
  private def pickCommentButton = commentRoot findElement  className("d-comment__action--pick")
  private def reportCommentButton = commentRoot findElement  className("d-comment__action--report")
  private def reportSelectControl = commentRoot findElement  name("category")
  private def reportTextArea = commentRoot findElement  id("d-report-comment__reason")
  private def reportEmail = commentRoot findElement  id("d-report-comment__email")
  private def sendReportButton = commentRoot findElement  cssSelector("button.d-report-comment__submit")
  private def showMoreRepliesButton = commentRoot findElement  className("d-show-more-replies")
  private def recommendCommentButton = commentRoot findElement  className("d-comment__recommend-button")
  private def commentAuthorAvatar = commentRoot findElement  className("d-comment__avatar")
  private def commentAuthorLink = commentRoot findElement  cssSelector(".d-comment__author a")
  private def commentTimeStamp = commentRoot findElement  className("d-comment__timestamp")
  private def oldRecommendCommentCount = commentRoot findElement  cssSelector(".d-comment__recommend-count--old")
  private def newRecommendCommentCount = commentRoot findElement  cssSelector(".d-comment__recommend-count--new")
  private def textDisplayed = commentRoot.findElement(cssSelector("" +
    ".d-comment__body p"))
  private def replyText = driver.get(Config().getTestBaseUrl() + Config().getUserValue("commentText"))

  def showCommentPost(): CommentItem = {
    showCommentButton.click()
    this
  }

  def replyToComment(replyText : String): CommentItem = {
    replyToCommentButton.click()
    commentTextArea.sendKeys(replyText)
    this
  }

  def postReply(): CommentItem = {
    postReplyButton.click()
    waitForNewCommentItem
  }

  def cancelReply(): CommentItem = {
    cancelReplyButton.click()
    this
  }

  def pickComment(): CommentItem = {
    pickCommentButton.click()
    this
  }

  def showAllReplies(): CommentItem = {
    showMoreRepliesButton.click()
    this
  }

  def reportComment(): CommentItem = {
    reportCommentButton.click()
    new Select(reportSelectControl).selectByVisibleText("Spam")
    reportTextArea.sendKeys("This is a test report")
    reportEmail.sendKeys("test.test@test.com")
    sendReportButton.click()
    this
  }

  def viewUserProfile(): CommentItem = {
    commentAuthorAvatar.click()
    this
  }

  def viewUserHistory() = {
    commentAuthorLink.click()
    UserProfilePage()
  }

  def getCommentAuthor(): String = {
    commentAuthorLink.getText()
  }

  def recommendComment(): (Int, Int) = {
    val oldRecommendCount = oldRecommendCommentCount.getText().toInt

    recommendCommentButton.click()

    val newRecommendCount = newRecommendCommentCount.getText().toInt
    (oldRecommendCount, newRecommendCount)
  }

  def isAvatarPresent(): Boolean = {
    commentAuthorAvatar.isDisplayed()
  }

  def isDateStampPresent(): Boolean = {
    commentTimeStamp.isDisplayed()
  }

  def getCommentText(): String = {
    textDisplayed.getText

  }

}

