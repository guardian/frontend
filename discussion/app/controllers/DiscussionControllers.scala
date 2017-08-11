package controllers

import com.softwaremill.macwire._
import discussion.api.DiscussionApi
import model.ApplicationContext
import play.api.libs.ws.WSClient
import play.filters.csrf.{CSRFAddToken, CSRFCheck}

trait DiscussionControllers {
  def wsClient: WSClient
  def discussionApi: DiscussionApi
  def csrfCheck: CSRFCheck
  def csrfAddToken: CSRFAddToken
  implicit def appContext: ApplicationContext
  lazy val commentCountController = wire[CommentCountController]
  lazy val commentsController = wire[CommentsController]
  lazy val profileActivityController = wire[ProfileActivityController]
  lazy val witnessActivityController = wire[WitnessActivityControllerImpl]
}
