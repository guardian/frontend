package football.controllers

import common.Edition
import feed.Competitions
import football.model._
import model._
import org.joda.time.DateMidnight
import pa.FootballTeam
import play.api.mvc.{Action, AnyContent}


object FixturesController extends MatchListController with CompetitionFixtureFilters {

  def allFixturesForJson(year: String, month: String, day: String) = allFixturesFor(year, month, day)
  def allFixturesFor(year: String, month: String, day: String): Action[AnyContent] =
    renderAllFixtures(createDate(year, month, day))

  def allFixturesJson() = allFixtures()
  def allFixtures(): Action[AnyContent] =
    renderAllFixtures(DateMidnight.now(Edition.defaultEdition.timezone))

  private def renderAllFixtures(date: DateMidnight) = Action { implicit request =>
    val fixtures = new FixturesList(date, Competitions())
    val page = new Page("football/fixtures", "football", "All fixtures", "GFE:Football:automatic:fixtures")
    renderMatchList(page, fixtures, filters)
  }

  def tagFixturesJson(tag: String) = tagFixtures(tag)
  def tagFixtures(tag: String): Action[AnyContent] =
    renderTagFixtures(DateMidnight.now(Edition.defaultEdition.timezone), tag)

  def tagFixturesForJson(year: String, month: String, day: String, tag: String) = tagFixturesFor(year, month, day, tag)
  def tagFixturesFor(year: String, month: String, day: String, tag: String): Action[AnyContent] =
    renderTagFixtures(createDate(year, month, day), tag)

  private def renderTagFixtures(date: DateMidnight, tag: String): Action[AnyContent] = {
    lookupCompetition(tag).map { comp =>
      renderCompetitionFixtures(tag, comp, date)
    }.orElse {
      lookupTeam(tag).map(renderTeamFixtures(tag, _, date))
    }.getOrElse {
      Action(NotFound)
    }
  }

  private def renderCompetitionFixtures(competitionName: String, competition: Competition, date: DateMidnight) = Action { implicit request =>
    val fixtures = new CompetitionFixturesList(date, Competitions(), competition.id)
    val page = new Page(s"football/$competitionName/fixtures", "football", s"${competition.fullName} fixtures", "GFE:Football:automatic:competition fixtures")
    renderMatchList(page, fixtures, filters)
  }

  private def renderTeamFixtures(teamName: String, team: FootballTeam, date: DateMidnight) = Action { implicit request =>
    val fixtures = new TeamFixturesList(date, Competitions(), team.id)
    val page = new Page(s"football/$teamName/fixtures", "football", s"${team.name} fixtures", "GFE:Football:automatic:team fixtures")
    renderMatchList(page, fixtures, filters)
  }

  def teamFixturesComponentJson(teamId: String) = teamFixturesComponent(teamId)
  def teamFixturesComponent(teamId: String) = Action { implicit request =>
    Competitions().findTeam(teamId).map { team =>
      val date = DateMidnight.now(Edition.defaultEdition.timezone)
      val fixtures = new TeamFixturesList(date, Competitions(), teamId, 2)
      val page = new Page(
        s"football/${team.id}/fixtures",
        "football",
        s"${team.name} fixtures",
        "GFE:Football:automatic:team fixtures"
      )
      renderMatchList(page, fixtures, filters)
    }.getOrElse(NotFound)
  }
}
