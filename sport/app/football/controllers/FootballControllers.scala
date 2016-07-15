package football.controllers

import com.softwaremill.macwire._

trait FootballControllers {
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
