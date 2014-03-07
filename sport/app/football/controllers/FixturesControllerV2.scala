package football.controllers

import feed.Competitions
import play.api.mvc.{RequestHeader, AnyContent, Action, Controller}
import org.joda.time.DateMidnight
import model._
import football.model._
import org.joda.time.format.DateTimeFormat
import pa.FootballTeam
import model.Competition
import common.JsonComponent
import play.api.templates.Html
import implicits.Requests


object FixturesControllerV2 extends Controller with CompetitionFixtureFilters with Requests {
  private val datePattern = DateTimeFormat.forPattern("yyyyMMMdd")
  private def createDate(year: String, month: String, day: String): DateMidnight =
    datePattern.parseDateTime(s"$year$month$day").toDateMidnight

  def allFixturesForJson(year: String, month: String, day: String) = allFixturesFor(year, month, day)
  def allFixturesFor(year: String, month: String, day: String): Action[AnyContent] =
    renderAllFixtures(createDate(year, month, day))

  def allFixturesJson() = allFixtures()
  def allFixtures(): Action[AnyContent] =
    renderAllFixtures(DateMidnight.now)

  private def renderAllFixtures(date: DateMidnight) = Action { implicit request =>
    val fixtures = new FixturesList(date, Competitions())
    val page = new Page(
      "football/fixtures",
      "football",
      "All fixtures",
      "GFE:Football:automatic:fixtures"
    )
    renderMatchList(page, fixtures)
  }

  def tagFixturesJson(tag: String) = tagFixtures(tag)
  def tagFixtures(tag: String): Action[AnyContent] =
    renderTagFixtures(DateMidnight.now, tag)
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
  private def lookupCompetition(tag: String): Option[Competition] = {
    Competitions().withTag(tag)
  }
  private def lookupTeam(tag: String): Option[FootballTeam] = {
    for {
      teamId <- TeamMap.findTeamIdByUrlName(tag)
      team <- Competitions().findTeam(teamId)
    } yield team
  }

  private def renderCompetitionFixtures(competitionName: String, competition: Competition, date: DateMidnight) = Action { implicit request =>
    val fixtures = new CompetitionFixturesList(date, Competitions(), competition.id)
    val page = new Page(
      "football/fixtures",
      "football",
      s"${competition.fullName} fixtures",
      "GFE:Football:automatic:competition fixtures"
    )
    renderMatchList(page, fixtures)
  }

  private def renderTeamFixtures(teamName: String, team: FootballTeam, date: DateMidnight) = Action { implicit request =>
    val fixtures = new TeamFixturesList(date, Competitions(), team.id)
    val page = new Page(
      s"football/$teamName/fixtures",
      "football",
      s"${team.name} fixtures",
      "GFE:Football:automatic:team fixtures"
    )
    renderMatchList(page, fixtures)
  }

  // to move to superclass and share with Results / Live Matches
  protected def renderMatchList(page: Page, matchesList: MatchesList)(implicit request: RequestHeader) = {
    Cached(page) {
      if (request.isJson)
        JsonComponent(
          page,
          "html" -> football.views.html.matchList.matchesList(matchesList),
          "more" -> Html(matchesList.nextPage.getOrElse(""))
        )
      else
        Ok(football.views.html.matchList.matchesPage(page, matchesList))
    }
  }
}
