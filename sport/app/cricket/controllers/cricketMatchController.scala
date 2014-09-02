package controllers

import common._
import model._
import play.api.libs.json.{JsArray, JsString}
import play.api.mvc.{ Controller, Action }
import cricketPa.PaFeed
import cricketModel.Match

case class CricketMatchPage(theMatch: Match, matchId: String) extends MetaData with ExecutionContexts {
  override lazy val id = s"sport/cricket/match/$matchId"
  override lazy val section = "cricket"
  override lazy val webTitle = s"${theMatch.competitionName}, ${theMatch.venueName}"
  override lazy val analyticsName = s"GFE:Cricket:automatic:match:"//${theMatch.gameDate.toString("dd MMM YYYY")}:${theMatch.homeTeam.name} v ${theMatch.awayTeam.name}"
}

object CricketMatchController extends Controller with Logging with ExecutionContexts {



  def renderMatchIdJson(matchId: String) = renderMatchId(matchId)

  def renderMatchId(matchId: String) = {
    Action.async { implicit request =>
      PaFeed.getMatch(matchId).map { matchData =>
        val page = CricketMatchPage(matchData, matchId)

        Cached(60){
        if (request.isJson)
          JsonComponent(
            "summary" -> cricket.views.html.fragments.cricketMatchSummary(page.theMatch).toString,
            "scorecard" -> cricket.views.html.fragments.cricketMiniScorecard(page).toString
          )
        else
          Ok(cricket.views.html.cricketMatch(page))
        }
      }
    }
  }

  def getMatches = Action.async { _ =>
    PaFeed.getMatchIds().map( matches => {

      Ok(JsArray(matches.map(JsString(_))))
    }).recover {
      case error: Throwable => Ok(error.getMessage)
    }

  }
}
