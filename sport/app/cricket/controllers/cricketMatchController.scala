package controllers

import common._
import model._
import play.api.mvc.{ Controller, Action }
import jobs.CricketStatsJob
import cricketPa.PaFeed.dateFormat
import cricketModel.Match

case class CricketMatchPage(theMatch: Match, matchId: String) extends MetaData with ExecutionContexts {
  override lazy val id = s"sport/cricket/match/$matchId"
  override lazy val section = "cricket"
  override lazy val webTitle = s"${theMatch.competitionName}, ${theMatch.venueName}"
  override lazy val analyticsName = s"GFE:Cricket:automatic:match:${dateFormat.print(theMatch.gameDate)}:${theMatch.homeTeam.name} v ${theMatch.awayTeam.name}"
}

object CricketMatchController extends Controller with Logging with ExecutionContexts {

  def renderMatchIdJson(date: String) = renderMatchId(date)

  // This date parameter should be a unique match identifier. Until we define the process for passing match identity,
  // this remains an implicit reference to 'england match on this date'.
  def renderMatchId(date: String) = {
    Action { implicit request =>
      CricketStatsJob.getMatch(date).map { matchData =>
        val page = CricketMatchPage(matchData, date)

        Cached(60){
          if (request.isJson)
            JsonComponent(
              "summary" -> cricket.views.html.fragments.cricketMatchSummary(page.theMatch).toString,
              "scorecard" -> cricket.views.html.fragments.cricketMiniScorecard(page).toString
            )
          else
            Ok(cricket.views.html.cricketMatch(page))
        }
      }.getOrElse(NotFound)
    }
  }
}
