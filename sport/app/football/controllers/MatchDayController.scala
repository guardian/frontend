package football.controllers

import feed.Competitions
import play.api.mvc.{AnyContent, Action}
import org.joda.time.DateMidnight
import model._
import football.model._
import common.JsonComponent


object MatchDayController extends MatchListController with CompetitionLiveFilters {

  def liveMatchesJson() = liveMatches()
  def liveMatches(): Action[AnyContent] =
    renderLiveMatches(DateMidnight.now)

  def matchesFor(year: String, month: String, day: String) =
    renderLiveMatches(createDate(year, month, day))
  def matchesForJson(year: String, month: String, day: String) =
    matchesFor(year, month, day)

  private def renderLiveMatches(date: DateMidnight) = Action { implicit request =>
    val matches = new MatchDayList(Competitions(), date)
    val webTitle = if (date == DateMidnight.now) "Live matches" else "Matches"
    val page = new Page("football/live", "football", webTitle, "GFE:Football:automatic:live matches")
    renderMatchList(page, matches, filters)
  }

  def competitionMatchesJson(competitionTag: String) = competitionMatches(competitionTag)
  def competitionMatches(competitionTag: String): Action[AnyContent] =
    renderCompetitionMatches(competitionTag, DateMidnight.now)

  def competitionMatchesFor(competitionTag: String, year: String, month: String, day: String) =
    renderCompetitionMatches(competitionTag, createDate(year, month, day))
  def competitionMatchesForJson(competitionTag: String, year: String, month: String, day: String) =
      competitionMatchesFor(competitionTag, year, month, day)

  private def renderCompetitionMatches(competitionTag: String, date: DateMidnight): Action[AnyContent] = Action { implicit request =>
    lookupCompetition(competitionTag).map { competition =>
      val webTitle = if (date == DateMidnight.now) s"Today's ${competition.fullName} matches" else s" ${competition.fullName} matches"
      val page = new Page(s"football/$competitionTag/live", "football", webTitle, "GFE:Football:automatic:live matches")
      val matches = new CompetitionMatchDayList(Competitions(), competition.id, date)
      renderMatchList(page, matches, filters)
    }.getOrElse {
      NotFound
    }
  }

//  @deprecated("Use JSON version of the normal match list endpoints", "early 2014")
  def matchDayComponent = Action { implicit request =>
    val matches = new MatchDayList(Competitions(), DateMidnight.now)
    val page = new Page("football", "football", "Today's matches", "GFE:Football:automatic:live matches")
    Cached(10) {
      JsonComponent(page, football.views.html.matchList.matchesComponent(matches))
    }
  }
}
