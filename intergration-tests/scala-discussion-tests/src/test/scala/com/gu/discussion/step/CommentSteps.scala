package com.gu.discussion.step

import com.gu.automation.support._
import com.gu.discussion.page._
import org.openqa.selenium.WebDriver
import org.scalatest.Matchers

case class CommentSteps(implicit driver: WebDriver, logger: TestLogger) extends Matchers with LoggingIn {

  def iAmSignedInAsAMember() = {
    logger.step("I am Staff user and signed into NGW")
    logInToGUPage(ArticlePage.goto, Some("memberLogin"))
    CommentSteps()
  }

  def iAmSignedInAsStaff() = {
    logger.step("I am Registered Member and signed into NGW")
    logInToGUPage(ArticlePage.goto)
    CommentSteps()
  }

  def iAmAGuestUser(): CommentSteps = {
    logger.step("I am Guest user to NGW")
    ArticlePage.goto
    this
  }

  def iViewAnArticleWithComments() = {
    logger.step("I view comments on an article")
    new ArticlePage().goToStartOfComments()
    this
  }

  def iViewAllComments() = {
    logger.step("I view all comments for a given article")
    new ArticlePage().showAllComments()
    this
  }

  def iCanPostANewComment() = {
    logger.step("I can post a new comment")
    new CommentModule().addNewComment()
    new CommentModule().postNewComment()

    val newComment = CommentItem().getLatestCommentText()

    newComment should be("This is a test comment - lorem ipsum dolor sit amet")
    this
  }

  def iCanPostANewReply() = {
    logger.step("I can post a new reply")
    new CommentModule().showAllComments()
    new CommentItem().replyToComment()
    new CommentItem().postReply()

    val newReply = CommentItem().getLatestCommentsLatestReply()
    newReply should be("Test reply please ignore - lorem ipsum dolor sit amet")
    this
  }

  def iCanReportAComment() = {
    logger.step("I can report a comment")
    new CommentItem().reportComment()
    this
  }

  def iCanViewUserCommentHistory() = {
    logger.step("I can view a users profile comment history")
    val originatingAuthor = CommentItem().getCommentAuthor()
    val userHistory = CommentItem().viewUserHistory()
    val userProfileName: String = userHistory.getUserProfileName

    userProfileName should be(originatingAuthor)

    viewUserCommentReplies()
    viewUserFeaturedComments()
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

  def iCanSearchUserComments() = {
    logger.step("I can search a users comment history")
    //viewUserCommentReplies()
    this
  }

  def iCanRecommendAComment() = {
    logger.step("I can recommend a comment")
    val recommendCommentCount = CommentItem().recommendComment()

    (recommendCommentCount._1, recommendCommentCount._2)

    recommendCommentCount._2 should be > recommendCommentCount._1
    this
  }

  def iCanPickAComment() = {
    logger.step("I can Pick a comment to be Featured")
    new CommentItem().pickComment()
    
    //TODO Assert if Picked comment is now featured
    
    this
  }

  def iCanNavigateCommentPages() = {
    logger.step("I can navigate through comments")
    new CommentModule().gotoNextPage()
    new CommentModule().gotoLastPage()
    new CommentModule().gotoPreviousPage()
    new CommentModule().gotofirstPage()
    new CommentModule().sortCommentsByOrder()
    this
  }

}
