package controllers

import common._
import cricketPa.PaFeed
import model._
import play.api.mvc.{ Controller, Action }
import jobs.CricketStatsJob
import cricketPa.PaFeed.dateFormat
import cricketModel.Match

case class CricketMatchPage(theMatch: Match, matchId: String) extends MetaData with ExecutionContexts {
  override lazy val id = s"/sport/cricket/match/$matchId"
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
      findMatchFromDate(date).map { matchData =>
        val page = CricketMatchPage(matchData, date)

        Cached(60){
          if (request.isJson)
            JsonComponent(
              "summary" -> cricket.views.html.fragments.cricketMatchSummary(page.theMatch, page.id).toString
            )
          else
            Ok(cricket.views.html.cricketMatch(page))
        }
      }.getOrElse(NoCache(NotFound))
    }
  }

  private def findMatchFromDate(date: String): Option[Match] = {
    // A test match runs over 5 days, so check the dates for the whole period.
    val requestDate = PaFeed.dateFormat.parseLocalDate(date)

    val matchObjects = for {
      day <- (0 until 5)
      date <- Some(PaFeed.dateFormat.print(requestDate.minusDays(day)))
    } yield {
      CricketStatsJob.getMatch(date)
    }
    matchObjects.flatten.headOption
  }
}
