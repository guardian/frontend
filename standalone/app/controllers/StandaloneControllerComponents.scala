package controllers

import com.softwaremill.macwire._
import _root_.commercial.controllers.CommercialControllers
import app.FrontendComponents
import controllers.front.FrontJsonFapiDraft
import cricket.controllers.CricketControllers
import dev.DevAssetsController
import football.controllers._
import play.api.{BuiltInComponents, Environment}
import play.api.libs.ws.WSClient
import rugby.controllers.RugbyControllers

trait StandaloneControllerComponents
  extends ApplicationsControllers
  with AdminJobsControllers
  with ArticleControllers
  with CommercialControllers
  with FaciaControllers
  with OnwardControllers
  with FootballControllers
  with CricketControllers
  with FrontendComponents
  with RugbyControllers {
  self: BuiltInComponents =>

  def wsClient: WSClient
  def frontJsonFapiDraft: FrontJsonFapiDraft

  lazy val assets = wire[Assets]
  lazy val devAssetsController = wire[DevAssetsController]
  lazy val emailSignupController = wire[EmailSignupController]
  lazy val faciaDraftController = wire[FaciaDraftController]
  lazy val faviconController = wire[FaviconController]
  lazy val itemController = wire[ItemController]
  lazy val oAuthLoginController = wire[OAuthLoginStandaloneController]
}
