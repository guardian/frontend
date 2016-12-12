package controllers

import com.softwaremill.macwire._
import discussion.api.DiscussionApi
import play.api.Environment
import play.api.libs.ws.WSClient
import play.filters.csrf.{CSRFAddToken, CSRFCheck}

trait DiscussionControllers {
  def wsClient: WSClient
  def discussionApi: DiscussionApi
  def csrfCheck: CSRFCheck
  def csrfAddToken: CSRFAddToken
  implicit def environment: Environment
  lazy val commentCountController = wire[CommentCountController]
  lazy val commentsController = wire[CommentsController]
  lazy val ctaController = wire[CtaController]
  lazy val profileActivityController = wire[ProfileActivityController]
  lazy val witnessActivityController = wire[WitnessActivityControllerImpl]
}
