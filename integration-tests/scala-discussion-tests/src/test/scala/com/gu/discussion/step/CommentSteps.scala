package com.gu.discussion.step

import com.gu.automation.support._
import com.gu.discussion.page._
import org.openqa.selenium.WebDriver
import org.scalatest.Matchers

case class CommentSteps(implicit driver: WebDriver) extends Matchers with LoggingIn with TestLogging {

  def iAmSignedInAsAMember() = {
    logger.step("I am Staff user and signed into NGW")
    logInToGUPage(()=>ArticlePage.goto(), Some("memberLogin"))
    CommentSteps()
  }

  def iAmSignedInAsStaff() = {
    logger.step("I am Registered Member and signed into NGW")
    logInToGUPage(()=>ArticlePage.goto())
    CommentSteps()
  }

  def iAmAGuestUser(): CommentSteps = {
    logger.step("I am Guest user to NGW")
    ArticlePage.goto()
    this
  }

  def iViewAnArticleWithComments() = {
    logger.step("I view comments on an article")
    ArticlePage().goToStartOfComments()
    this
  }

  def iViewAllComments() = {
    logger.step("I view all comments for a given article")
    ArticlePage().showAllComments()
    this
  }

  private val newCommentText: String = "This is a test comment - lorem ipsum dolor sit amet"

  def iCanPostANewComment() = {
    logger.step("I can post a new comment")
    val module = CommentModule()
    module.addNewComment(newCommentText)
    val newCommentItem =  module.postNewComment()
    val newComment = newCommentItem.getCommentText()

    newComment should be(newCommentText)
    this
  }

  private val newReplyText: String = "This is a test reply - Please ignonre"

  def iCanPostANewReply() = {
    logger.step("I can post a new reply")
    val commentModule = CommentModule()
      commentModule.showAllComments()
    val latestComment = commentModule.getLatestComment()
    latestComment.replyToComment(newReplyText)

    val newReplyItem = latestComment.postReply()

    val newReply = newReplyItem.getCommentText()
    newReply should be (newReplyText)
    this
  }

  private val newReportText: String = "This is a test report - please ignore"

  def iCanReportAComment() = {
    logger.step("I can report a comment")
    val commentModule = CommentModule()
    CommentModule().getLatestComment().reportComment()
    this
  }

  def iCanViewUserCommentHistory() = {
    logger.step("I can view a users profile comment history")
    val originatingAuthor = CommentModule().getLatestComment().getCommentAuthor()
    val userHistory = CommentModule().getLatestComment().viewUserHistory()
    val userProfileName: String = userHistory.getUserProfileName

    userProfileName should be(originatingAuthor)

    viewUserCommentReplies()
    viewUserFeaturedComments()
    viewUserComments()
    this
  }

  def viewUserComments() = {
    UserProfilePage().viewProfileComments()
    this
  }

  def viewUserCommentReplies() = {
    UserProfilePage().viewProfileReplies()
    this
  }

  def viewUserFeaturedComments() = {
    UserProfilePage().viewProfileFeatured()
    this
  }

  def iViewAUsersCommentHistory() = {
    logger.step("I can view a users comment history")
    UserProfilePage.goto
    this
  }

  def iCanSearchUserComments() = {
    logger.step("I can search a users comment history")
    UserProfilePage().searchForComment()
    this
  }

  def iCanRecommendAComment() = {
    logger.step("I can recommend a comment")
    val recommendCommentCount = CommentModule().getLatestComment().recommendComment()

    (recommendCommentCount._1, recommendCommentCount._2)

    recommendCommentCount._2 should be > recommendCommentCount._1
    this
  }

  def iCanPickAComment() = {
    logger.step("I can Pick a comment to be Featured")
    CommentModule().getLatestComment().pickComment()
    //Assert commentPicked once it is featured
    this
  }

  def iCanNavigateCommentPages() = {
    logger.step("I can navigate through comments")
    CommentModule().gotoNextPage()
    CommentModule().gotoLastPage()
    CommentModule().gotoPreviousPage()
    CommentModule().gotofirstPage()
    CommentModule().sortCommentsByOrder()
    this
  }

}
