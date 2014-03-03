package football.controllers

import feed.Competitions
import play.api.mvc.{Action, Controller}
import org.joda.time.DateMidnight
import model.Competition
import football.model.FixturesList


object FixturesControllerV2 extends Controller with CompetitionFixtureFilters {

  def renderTeamFixtures(teamName: String, teamId: String) = Action { implicit request =>
    val fixtures = FixturesList(DateMidnight.now(), Competitions())

    ???
  }

  def renderCompetitionFixtures(competitionName: String, competition: Competition, dateOpt: Option[DateMidnight]) = Action { implicit request =>
    ???
  }

  def renderFixtures(dateOpt: Option[DateMidnight]) = Action { implicit request =>
    ???
  }
}
