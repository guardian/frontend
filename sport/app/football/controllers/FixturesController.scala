package football.controllers

import common.Edition
import feed.CompetitionsService
import football.model._
import model._
import org.joda.time.LocalDate
import pa.FootballTeam
import play.api.mvc.{Action, AnyContent, ControllerComponents}

class FixturesController(
    val competitionsService: CompetitionsService,
    val controllerComponents: ControllerComponents,
)(implicit context: ApplicationContext)
    extends MatchListController
    with CompetitionFixtureFilters {

  private def fixtures(date: LocalDate): FixturesList = FixturesList(date, competitionsService.competitions)
  private val page = new FootballPage("football/fixtures", "football", "All fixtures")

  def allFixturesForJson(year: String, month: String, day: String): Action[AnyContent] =
    allFixturesFor(year, month, day)
  def allFixturesFor(year: String, month: String, day: String): Action[AnyContent] =
    renderAllFixtures(createDate(year, month, day))

  def allFixturesJson(): Action[AnyContent] = allFixtures()
  def allFixtures(): Action[AnyContent] =
    renderAllFixtures(LocalDate.now(Edition.defaultEdition.timezone))

  def moreFixturesFor(year: String, month: String, day: String): Action[AnyContent] =
    renderMoreFixtures(createDate(year, month, day))

  def moreFixturesForJson(year: String, month: String, day: String): Action[AnyContent] =
    moreFixturesFor(year, month, day)

  private def renderAllFixtures(date: LocalDate): Action[AnyContent] =
    Action { implicit request =>
      renderMatchList(page, fixtures(date), filters)
    }

  private def renderMoreFixtures(date: LocalDate): Action[AnyContent] =
    Action { implicit request =>
      renderMoreMatches(page, fixtures(date), filters)
    }

  def tagFixturesJson(tag: String): Action[AnyContent] = tagFixtures(tag)
  def tagFixtures(tag: String): Action[AnyContent] =
    renderTagFixtures(LocalDate.now(Edition.defaultEdition.timezone), tag)

  def tagFixturesForJson(year: String, month: String, day: String, tag: String): Action[AnyContent] =
    tagFixturesFor(year, month, day, tag)
  def tagFixturesFor(year: String, month: String, day: String, tag: String): Action[AnyContent] =
    renderTagFixtures(createDate(year, month, day), tag)

  private def renderTagFixtures(date: LocalDate, tag: String): Action[AnyContent] = {
    lookupCompetition(tag)
      .map { comp =>
        renderCompetitionFixtures(tag, comp, date)
      }
      .orElse {
        lookupTeam(tag).map(renderTeamFixtures(tag, _, date))
      }
      .getOrElse {
        Action(NotFound)
      }
  }

  private def renderCompetitionFixtures(
      competitionName: String,
      competition: Competition,
      date: LocalDate,
  ): Action[AnyContent] =
    Action { implicit request =>
      val fixtures = CompetitionFixturesList(date, competitionsService.competitions, competition.id)
      val page =
        new FootballPage(s"football/$competitionName/fixtures", "football", s"${competition.fullName} fixtures")
      renderMatchList(page, fixtures, filters)
    }

  private def renderTeamFixtures(teamName: String, team: FootballTeam, date: LocalDate): Action[AnyContent] =
    Action { implicit request =>
      val fixtures = TeamFixturesList(date, competitionsService.competitions, team.id)
      val page = new FootballPage(s"football/$teamName/fixtures", "football", s"${team.name} fixtures")
      renderMatchList(page, fixtures, filters)
    }

  def teamFixturesComponentJson(teamId: String): Action[AnyContent] = teamFixturesComponent(teamId)
  def teamFixturesComponent(teamId: String): Action[AnyContent] =
    Action { implicit request =>
      competitionsService
        .findTeam(teamId)
        .map { team =>
          val now = LocalDate.now(Edition.defaultEdition.timezone)
          val fixtures = TeamFixturesList(now, competitionsService.competitions, teamId)
          val page = new FootballPage(
            s"football/${team.id}/fixtures",
            "football",
            s"${team.name} fixtures",
          )
          renderMatchList(page, fixtures, filters)
        }
        .getOrElse(NotFound)
    }
}
