package com.gu.discussion.page

import com.gu.automation.support.page.Element._
import org.openqa.selenium.support.ui.Select
import org.openqa.selenium.WebDriver
import org.openqa.selenium.By._

case class CommentItem(implicit driver: WebDriver) {

  private val latestComment = driver element cssSelector(".discussion__comments__container .d-comment")
  private def commentBody = latestComment element className("d-comment__body")
  private def showCommentButton = latestComment element className("d-comment-box__show-parent")
  private def replyToCommentButton = latestComment element className("d-comment__action--reply")
  private def commentTextArea = latestComment element cssSelector("textarea[name=\"body\"]")
  private def postReplyButton = latestComment element className("d-comment-box__submit")
  private def cancelReplyButton = latestComment element className("d-comment-box__cancel")
  private def pickCommentButton = latestComment element className("d-comment__action--pick")
  private def reportCommentButton = latestComment element className("d-comment__action--report")
  private def reportSelectControl = latestComment element name("category")
  private def reportTextArea = latestComment element id("d-report-comment__reason")
  private def reportEmail = latestComment element id("d-report-comment__email")
  private def sendReportButton = latestComment element cssSelector("button.d-report-comment__submit")
  private def showMoreRepliesButton = latestComment element className("d-show-more-replies")
  private def recommendCommentButton = latestComment element className("d-comment__recommend-button")
  private def commentAuthorAvatar = latestComment element className("d-comment__avatar")
  private def commentAuthorLink = latestComment element cssSelector(".d-comment__author a")
  private def commentTimeStamp = latestComment element className("d-comment__timestamp")
  private def oldRecommendCommentCount = latestComment element cssSelector(".d-comment__recommend-count--old")
  private def newRecommendCommentCount = latestComment element cssSelector(".d-comment__recommend-count--new")

  def showCommentPost(): CommentItem = {
    showCommentButton.click()
    this
  }

  def replyToComment(): CommentItem = {
    replyToCommentButton.click()
    commentTextArea.sendKeys("Test reply please ignore - lorem ipsum dolor sit amet")
    CommentItem()
  }

  def postReply(): CommentItem = {
    postReplyButton.click()

    //Ugly hack to wait for URL to change
    var retries = 10
    while (!driver.getCurrentUrl().contains("#comment-") || retries < 0) {
      Thread.sleep(500)
      retries = retries - 1
    }
    this
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

  def getLatestCommentText(): String = {
    val newCommentURL = driver.getCurrentUrl()
    val newCommentID = newCommentURL.substring(newCommentURL.indexOf("#") + 1)
    driver.findElement(id(s"$newCommentID")).findElement(cssSelector(".d-comment__body p")).getText()
  }

  def getLatestCommentsLatestReply(): String = {
    val newReplyURL = driver.getCurrentUrl()
    val newReplyID = newReplyURL.substring(newReplyURL.indexOf("#") + 1)
    driver.findElement(id(s"$newReplyID")).findElement(cssSelector(".d-comment__body p")).getText()
  }

  def goToLatestComment(): CommentItem =  {
    commentBody.isDisplayed()
    this
  }

}

