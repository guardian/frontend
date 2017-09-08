package cricket.controllers

import common._
import cricketModel.Match
import conf.cricketPa.PaFeed.dateFormat
import conf.cricketPa.{CricketTeam, CricketTeams}
import jobs.CricketStatsJob
import model.Cached.RevalidatableResult
import model._
import play.api.mvc.{Action, Controller}

case class CricketMatchPage(theMatch: Match, matchId: String, team: CricketTeam) extends StandalonePage {
  override val metadata = MetaData.make(
    id = s"/sport/cricket/match/$matchId/${team.wordsForUrl}",
    section = Some(SectionSummary.fromId("cricket")),
    webTitle = s"${theMatch.competitionName}, ${theMatch.venueName}")
}

class CricketMatchController(cricketStatsJob: CricketStatsJob)(implicit context: ApplicationContext) extends Controller with Logging with ExecutionContexts {

  def renderMatchIdJson(date: String, teamId: String) = renderMatchId(date, teamId)

  def renderMatchId(date: String, teamId: String) = Action { implicit request =>
    CricketTeams.byWordsForUrl(teamId).flatMap { team =>
      cricketStatsJob.findMatch(team, date).map { matchData =>
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
