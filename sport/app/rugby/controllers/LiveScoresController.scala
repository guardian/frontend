package rugby.controllers

import common._

import common.{ExecutionContexts, JsonComponent}
import model.{Cached, MetaData}
import play.api.mvc.{Action, Controller}
import rugby.feed.OptaFeed
import rugby.model.LiveScore

case class LiveScorePage(liveScore: LiveScore) extends MetaData with ExecutionContexts {
  override lazy val id = s"/sport/rugby/api/live-score/${liveScore.date.toString("yyyy/MMM/dd")}/${liveScore.homeTeam.id}/${liveScore.awayTeam.id}"
  override lazy val section = "rugby"
  override lazy val webTitle = s"${liveScore.homeTeam.name} v ${liveScore.awayTeam.name} "
  override lazy val analyticsName = s"GFE:Rugby:automatic:match:${liveScore.date.toString("dd MMM YYYY")}:${liveScore.homeTeam.name} v ${liveScore.awayTeam.name}"
}

object LiveScoresController extends Controller {

  def liveScoreJson(year: String, month: String, day: String, homeTeamId: String, awayTeamId: String) = liveScore(year, month, day, homeTeamId, awayTeamId)

  def liveScore(year: String, month: String, day: String, homeTeamId: String, awayTeamId: String) = Action { implicit request =>
    OptaFeed.getLiveScore(year, month, day, homeTeamId, awayTeamId).map { liveScore =>
      val page = LiveScorePage(liveScore)
      Cached(60){
        if (request.isJson)
          JsonComponent(
            "liveScore" -> rugby.views.html.fragments.liveScore(page, liveScore).toString
          )
        else
          Ok(rugby.views.html.liveScore(page, liveScore))
      }

    }.getOrElse(NotFound)
  }
}
