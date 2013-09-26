package controllers

import common._
import model._
import play.api.mvc.{ Controller, Action }
import cricketOpta.Feed
import cricketModel.Match

case class CricketMatchPage(theMatch: Match, matchId: String) extends MetaData with ExecutionContexts {

  override lazy val id = s"sport/cricket/match/$matchId"
  override lazy val section = "cricket"
  override lazy val webTitle = s"${theMatch.description}, ${theMatch.venueName}"
  override lazy val analyticsName = s"GFE:Cricket:automatic:match:${theMatch.gameDate.toString("dd MMM YYYY")}:${theMatch.homeTeam.name} v ${theMatch.awayTeam.name}"
}

object CricketMatchController extends Controller with Logging with ExecutionContexts {

  def renderMatchId(matchId: String) = Action { implicit request =>

    val promiseOfCricketMatch = Feed.getMatchSummary(matchId)

    Async {
      promiseOfCricketMatch.map { matchSummary =>

          val page = CricketMatchPage(matchSummary, matchId)

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
}
