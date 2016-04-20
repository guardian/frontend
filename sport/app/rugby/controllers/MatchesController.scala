package rugby.controllers

import common.{ExecutionContexts, JsonComponent, _}
import model.{MetaData, StandalonePage, Cached}
import play.api.mvc.{Action, Controller}
import play.twirl.api.Html
import rugby.feed.CapiFeed
import rugby.jobs.RugbyStatsJob
import rugby.model.Match

case class MatchPage(liveScore: Match) extends StandalonePage {
  override val metadata = MetaData.make(
    id = s"/sport/rugby/api/score/${liveScore.date.toString("yyyy/MMM/dd")}/${liveScore.homeTeam.id}/${liveScore.awayTeam.id}",
    section = "rugby",
    webTitle = s"${liveScore.homeTeam.name} v ${liveScore.awayTeam.name} ",
    analyticsName = s"GFE:Rugby:automatic:match:${liveScore.date.toString("dd MMM YYYY")}:${liveScore.homeTeam.name} v ${liveScore.awayTeam.name}")
}

object MatchesController extends Controller with Logging with ExecutionContexts {

  def scoreJson(year: String, month: String, day: String, homeTeamId: String, awayTeamId: String) = score(year, month, day, homeTeamId, awayTeamId)

  def score(year: String, month: String, day: String, team1: String, team2: String) = Action { implicit request =>

    val matchOpt = RugbyStatsJob.getFixturesAndResultScore(year, month, day, team1, team2)

    val currentPage = request.getParameter("page")

    matchOpt.map { aMatch =>
      val matchNav = CapiFeed.findMatchArticle(aMatch).map(rugby.views.html.fragments.matchNav(_, currentPage).toString)

      val scoreEvents = RugbyStatsJob.getScoreEvents(aMatch)
      val (homeTeamScorers, awayTeamScorers) =  scoreEvents.partition(_.player.team.id == aMatch.homeTeam.id)

      val matchStat = RugbyStatsJob.getMatchStat(aMatch)
      val table = RugbyStatsJob.getGroupTable(aMatch)

      val page = MatchPage(aMatch)
      Cached(60){
        if (request.isJson)
          JsonComponent(
            "matchSummary" -> rugby.views.html.fragments.matchSummary(page, aMatch).toString,
            "scoreEvents" -> rugby.views.html.fragments.scoreEvents(aMatch, homeTeamScorers, awayTeamScorers).toString,
            "dropdown" -> views.html.fragments.dropdown("", isClientSideTemplate = true)(Html("")),
            "nav" -> matchNav.getOrElse(""),
            "matchStat" -> rugby.views.html.fragments.matchStats(aMatch, matchStat),
            "groupTable" -> rugby.views.html.fragments.groupTable(aMatch, table)
          )
        else
          Ok(rugby.views.html.matchSummary(page, aMatch, homeTeamScorers, awayTeamScorers))
      }

    }.getOrElse(NotFound)
  }
}
