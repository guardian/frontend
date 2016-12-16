package controllers

import com.softwaremill.macwire._
import discussion.api.DiscussionApi
import model.ApplicationContext
import play.api.Environment
import play.api.libs.ws.WSClient
import play.filters.csrf.CSRFComponents

trait DiscussionControllers extends CSRFComponents {
  def wsClient: WSClient
  def discussionApi: DiscussionApi
  implicit def appContext: ApplicationContext
  lazy val commentCountController = wire[CommentCountController]
  lazy val commentsController = wire[CommentsController]
  lazy val ctaController = wire[CtaController]
  lazy val profileActivityController = wire[ProfileActivityController]
  lazy val witnessActivityController = wire[WitnessActivityControllerImpl]
}
