package football.controllers

import feed.CompetitionsService
import play.api.mvc.{Action, AnyContent, ControllerComponents}
import org.joda.time.LocalDate
import model._
import football.model._
import common.{Edition, JsonComponent}

class MatchDayController(
    val competitionsService: CompetitionsService,
    val controllerComponents: ControllerComponents,
)(implicit context: ApplicationContext)
    extends MatchListController
    with CompetitionLiveFilters {

  def liveMatchesJson(): Action[AnyContent] = liveMatches()
  def liveMatches(): Action[AnyContent] =
    renderLiveMatches(LocalDate.now(Edition.defaultEdition.timezone))

  def matchesFor(year: String, month: String, day: String): Action[AnyContent] =
    renderLiveMatches(createDate(year, month, day))
  def matchesForJson(year: String, month: String, day: String): Action[AnyContent] =
    matchesFor(year, month, day)

  private def renderLiveMatches(date: LocalDate): Action[AnyContent] =
    Action { implicit request =>
      val matches = MatchDayList(competitionsService.competitions, date)
      val webTitle = if (date == LocalDate.now(Edition.defaultEdition.timezone)) "Live matches" else "Matches"
      val page = new FootballPage("football/live", "football", webTitle)
      renderMatchList(page, matches, filters)
    }

  def competitionMatchesJson(competitionTag: String): Action[AnyContent] = competitionMatches(competitionTag)
  def competitionMatches(competitionTag: String): Action[AnyContent] =
    renderCompetitionMatches(competitionTag, LocalDate.now(Edition.defaultEdition.timezone))

  def competitionMatchesFor(competitionTag: String, year: String, month: String, day: String): Action[AnyContent] =
    renderCompetitionMatches(competitionTag, createDate(year, month, day))
  def competitionMatchesForJson(competitionTag: String, year: String, month: String, day: String): Action[AnyContent] =
    competitionMatchesFor(competitionTag, year, month, day)

  private def renderCompetitionMatches(competitionTag: String, date: LocalDate): Action[AnyContent] =
    Action { implicit request =>
      lookupCompetition(competitionTag)
        .map { competition =>
          val webTitle =
            if (date == LocalDate.now(Edition.defaultEdition.timezone)) s"Today's ${competition.fullName} matches"
            else s" ${competition.fullName} matches"
          val page = new FootballPage(s"football/$competitionTag/live", "football", webTitle)
          val matches = CompetitionMatchDayList(competitionsService.competitions, competition.id, date)
          renderMatchList(page, matches, filters)
        }
        .getOrElse {
          NotFound
        }
    }

//  @deprecated("Use JSON version of the normal match list endpoints", "early 2014")
  def matchDayComponent: Action[AnyContent] =
    Action { implicit request =>
      val matches = MatchDayList(competitionsService.competitions, LocalDate.now(Edition.defaultEdition.timezone))
      val page = new FootballPage("football", "football", "Today's matches")
      Cached(10) {
        JsonComponent(page, football.views.html.matchList.matchesComponent(matches))
      }
    }
}
