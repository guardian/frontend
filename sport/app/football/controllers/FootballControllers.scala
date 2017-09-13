package football.controllers

import com.softwaremill.macwire._
import conf.FootballClient
import contentapi.ContentApiClient
import feed.CompetitionsService
import model.ApplicationContext
import play.api.mvc.ControllerComponents

trait FootballControllers {
  def competitionsService: CompetitionsService
  def footballClient: FootballClient
  def contentApiClient: ContentApiClient
  def controllerComponents: ControllerComponents
  implicit def appContext: ApplicationContext
  lazy val fixturesController = wire[FixturesController]
  lazy val resultsController = wire[ResultsController]
  lazy val matchDayController = wire[MatchDayController]
  lazy val leagueTableController = wire[LeagueTableController]
  lazy val wallchartController = wire[WallchartController]
  lazy val moreOnMatchController = wire[MoreOnMatchController]
  lazy val competitionListController = wire[CompetitionListController]
  lazy val fixturesAndResultsContainerController = wire[FixturesAndResultsContainerController]
  lazy val matchController = wire[MatchController]
}
