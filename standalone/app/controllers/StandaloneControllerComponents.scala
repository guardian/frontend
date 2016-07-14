package controllers

import com.softwaremill.macwire._
import controllers.commercial.CommercialControllers
import dev.DevAssetsController
import football.controllers._
import play.api.BuiltInComponents
import rugby.controllers.MatchesController

trait StandaloneControllerComponents
  extends ApplicationsControllers
  with AdminJobsControllers
  with ArticleControllers
  with CommercialControllers
  with FaciaControllers
  with OnwardControllers {
  self: BuiltInComponents =>

  lazy val assets = wire[Assets]
  lazy val competitionListController = wire[CompetitionListController]
  lazy val cricketMatchController = wire[CricketMatchController]
  lazy val devAssetsController = wire[DevAssetsController]
  lazy val emailSignupController = wire[EmailSignupController]
  lazy val faciaDraftController: FaciaDraftController = wire[FaciaDraftController]
  lazy val faviconController = wire[FaviconController]
  lazy val fixturesController = wire[FixturesController]
  lazy val itemController = wire[ItemController]
  lazy val leagueTableController = wire[LeagueTableController]
  lazy val matchController = wire[MatchController]
  lazy val matchDayController = wire[MatchDayController]
  lazy val matchesController = wire[MatchesController]
  lazy val moreOnMatchController = wire[MoreOnMatchController]
  lazy val oAuthLoginController = wire[OAuthLoginController]
  lazy val resultsController = wire[ResultsController]
  lazy val wallchartController = wire[WallchartController]
}
