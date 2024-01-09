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
  lazy val fixturesController: FixturesController = wire[FixturesController]
  lazy val resultsController: ResultsController = wire[ResultsController]
  lazy val matchDayController: MatchDayController = wire[MatchDayController]
  lazy val leagueTableController: LeagueTableController = wire[LeagueTableController]
  lazy val wallchartController: WallchartController = wire[WallchartController]
  lazy val moreOnMatchController: MoreOnMatchController = wire[MoreOnMatchController]
  lazy val competitionListController: CompetitionListController = wire[CompetitionListController]
  lazy val fixturesAndResultsContainerController: FixturesAndResultsContainerController =
    wire[FixturesAndResultsContainerController]
  lazy val matchController: MatchController = wire[MatchController]
}
