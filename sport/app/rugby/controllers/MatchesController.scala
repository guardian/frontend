package rugby.controllers

import common._

import common.{ExecutionContexts, JsonComponent}
import model.{Cached, MetaData}
import play.api.mvc.{Action, Controller}
import rugby.feed.{CapiFeed, OptaFeed}
import rugby.model.Match

case class MatchPage(liveScore: Match) extends MetaData {
  override lazy val id = s"/sport/rugby/api/score/${liveScore.date.toString("yyyy/MMM/dd")}/${liveScore.homeTeam.id}/${liveScore.awayTeam.id}"
  override lazy val section = "rugby"
  override lazy val webTitle = s"${liveScore.homeTeam.name} v ${liveScore.awayTeam.name} "
  override lazy val analyticsName = s"GFE:Rugby:automatic:match:${liveScore.date.toString("dd MMM YYYY")}:${liveScore.homeTeam.name} v ${liveScore.awayTeam.name}"
}

object MatchesController extends Controller with Logging with ExecutionContexts {

  def scoreJson(year: String, month: String, day: String, homeTeamId: String, awayTeamId: String) = score(year, month, day, homeTeamId, awayTeamId)

  def score(year: String, month: String, day: String, team1: String, team2: String) = Action { implicit request =>
    val matchFixture = OptaFeed.getFixturesAndResults(year, month, day, team1, team2)
    val scoreOpt = OptaFeed.getLiveScore(year, month, day, team1, team2)
      .map ( m => m.copy( venue = matchFixture.flatMap(_.venue)))
      .orElse(matchFixture)
      .filter(m => m.awayTeam.score.isDefined && m.homeTeam.score.isDefined)

    scoreOpt.map { score =>
      val matchNav = CapiFeed.findMatchArticle(score)
      val page = MatchPage(score)
      Cached(60){
        if (request.isJson)
          JsonComponent(
            "liveScore" -> rugby.views.html.fragments.liveScore(page, score).toString,
            "minByMin" -> matchNav.map(_.minByMin.url).getOrElse(""),
            "matchReport" -> matchNav.map(_.matchReport.url).getOrElse("")
          )
        else
          Ok(rugby.views.html.liveScore(page, score))
      }

    }.getOrElse(NotFound)
  }
}
