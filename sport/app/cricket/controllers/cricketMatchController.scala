package controllers

import common._
import cricketPa.PaFeed
import model._
import play.api.mvc.{ Controller, Action }
import cricketPa.PaFeed.dateFormat
import cricketModel.Match

case class CricketMatchPage(theMatch: Match, matchId: String) extends StandalonePage {
  override val metadata = MetaData.make(
    id = s"/sport/cricket/match/$matchId",
    section = "cricket",
    webTitle = s"${theMatch.competitionName}, ${theMatch.venueName}",
    analyticsName = s"GFE:Cricket:automatic:match:${dateFormat.print(theMatch.gameDate)}:${theMatch.homeTeam.name} v ${theMatch.awayTeam.name}")
}

object CricketMatchController extends Controller with Logging with ExecutionContexts {

  def renderMatchIdJson(date: String) = renderMatchId(date)

  // This date parameter should be a unique match identifier. Until we define the process for passing match identity,
  // this remains an implicit reference to 'england match on this date'.
  def renderMatchId(date: String) = {
    Action { implicit request =>
      PaFeed.findMatchFromDate(date).map { matchData =>
        val page = CricketMatchPage(matchData, date)

        Cached(60){
          if (request.isJson)
            JsonComponent(
              "summary" -> cricket.views.html.fragments.cricketMatchSummary(page.theMatch, page.metadata.id).toString
            )
          else
            Ok(cricket.views.html.cricketMatch(page))
        }
      }.getOrElse(NoCache(NotFound))
    }
  }


}
