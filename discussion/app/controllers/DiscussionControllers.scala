package controllers

import com.softwaremill.macwire._
import discussion.DiscussionApi
import play.api.libs.ws.WSClient
import play.filters.csrf.CSRFComponents

trait DiscussionControllers extends CSRFComponents {
  def wsClient: WSClient
  def discussionApi: DiscussionApi
  lazy val commentCountController = wire[CommentCountController]
  lazy val commentsController = wire[CommentsController]
  lazy val ctaController = wire[CtaController]
  lazy val profileActivityController = wire[ProfileActivityController]
  lazy val witnessActivityController = wire[WitnessActivityControllerImpl]
}
