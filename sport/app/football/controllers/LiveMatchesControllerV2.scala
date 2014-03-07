package football.controllers

import feed.Competitions
import play.api.mvc.{AnyContent, Action}
import org.joda.time.DateMidnight
import model._
import football.model._


object LiveMatchesControllerV2 extends MatchListController {

  def liveMatchesJson() = liveMatches()
  def liveMatches(): Action[AnyContent] =
    renderLiveMatches(DateMidnight.now)

  private def renderLiveMatches(date: DateMidnight) = Action { implicit request =>
    val liveMatches = new LiveMatchesList(Competitions())
    val page = new Page("football/live", "football", "Today's matches", "GFE:Football:automatic:live matches")
    renderMatchList(page, liveMatches)
  }

  def competitionMatchesJson(competitionTag: String) = competitionMatches(competitionTag)
  def competitionMatches(competitionTag: String): Action[AnyContent] =
    renderCompetitionMatches(competitionTag)

  private def renderCompetitionMatches(competitionTag: String): Action[AnyContent] = Action { implicit request =>
    lookupCompetition(competitionTag).map { competition =>
      val page = new Page(s"football/$competitionTag/live", "football", s"Today's ${competition.fullName} matches", "GFE:Football:automatic:live matches")
      val liveMatches = new CompetitionLiveMatchesList(Competitions(), competition.id)
      renderMatchList(page, liveMatches)
    }.getOrElse {
      NotFound
    }
  }
}
