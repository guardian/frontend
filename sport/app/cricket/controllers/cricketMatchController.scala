package controllers

import common._
import cricketPa.{CricketTeam, CricketTeams, PaFeed}
import model._
import play.api.mvc.{ Controller, Action }
import cricketPa.PaFeed.dateFormat
import cricketModel.Match

case class CricketMatchPage(theMatch: Match, matchId: String, team: CricketTeam) extends StandalonePage {
  override val metadata = MetaData.make(
    id = s"/sport/cricket/match/$matchId/${team.wordsForUrl}",
    section = "cricket",
    webTitle = s"${theMatch.competitionName}, ${theMatch.venueName}",
    analyticsName = s"GFE:Cricket:automatic:match:${dateFormat.print(theMatch.gameDate)}:${theMatch.homeTeam.name} v ${theMatch.awayTeam.name}")
}

object CricketMatchController extends Controller with Logging with ExecutionContexts {

  def renderMatchIdJson(date: String, teamId: String) = renderMatchId(date, teamId)

  def renderMatchId(date: String, teamId: String) = Action { implicit request =>
    CricketTeams.byWordsForUrl(teamId).flatMap { team =>
      PaFeed.findMatch(team, date).map { matchData =>
        val page = CricketMatchPage(matchData, date, team)
        Cached(60) {
          if (request.isJson)
            JsonComponent(
              "summary" -> cricket.views.html.fragments.cricketMatchSummary(page.theMatch, page.metadata.id).toString
            )
          else
            Ok(cricket.views.html.cricketMatch(page))
        }
      }
    }.getOrElse(NoCache(NotFound))
  }

}
