package cricket.controllers

import common._
import cricketModel.Match
import cricketPa.PaFeed.dateFormat
import cricketPa.{CricketTeam, CricketTeams, PaFeed}
import model.Cached.RevalidatableResult
import model._
import play.api.mvc.{Action, Controller}

case class CricketMatchPage(theMatch: Match, matchId: String, team: CricketTeam) extends StandalonePage {
  override val metadata = MetaData.make(
    id = s"/sport/cricket/match/$matchId/${team.wordsForUrl}",
    section = Some(SectionSummary.fromId("cricket")),
    webTitle = s"${theMatch.competitionName}, ${theMatch.venueName}",
    analyticsName = s"GFE:Cricket:automatic:match:${dateFormat.print(theMatch.gameDate)}:${theMatch.homeTeam.name} v ${theMatch.awayTeam.name}")
}

class CricketMatchController extends Controller with Logging with ExecutionContexts {

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
            RevalidatableResult.Ok(cricket.views.html.cricketMatch(page))
        }
      }
    }.getOrElse(NoCache(NotFound))
  }

}

object CricketMatchController extends CricketMatchController
