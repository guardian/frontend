package controllers

import com.softwaremill.macwire._
import controllers.commercial.CommercialControllers
import cricket.controllers.CricketControllers
import dev.DevAssetsController
import football.controllers._
import play.api.BuiltInComponents
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
  with RugbyControllers {
  self: BuiltInComponents =>

  lazy val assets = wire[Assets]
  lazy val devAssetsController = wire[DevAssetsController]
  lazy val emailSignupController = wire[EmailSignupController]
  lazy val faciaDraftController: FaciaDraftController = wire[FaciaDraftController]
  lazy val faviconController = wire[FaviconController]
  lazy val itemController = wire[ItemController]
  lazy val oAuthLoginController = wire[OAuthLoginController]
}
