package cricket.controllers

import common._
import conf.Configuration
import cricketModel.Match
import conf.cricketPa.{CricketTeam, CricketTeams}
import football.model.DotcomRenderingCricketDataModel
import jobs.CricketStatsJob
import model.Cached.RevalidatableResult
import model._
import play.api.libs.json.Json
import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents}

case class CricketMatchPage(theMatch: Match, matchId: String, team: CricketTeam) extends StandalonePage {
  override val metadata = MetaData.make(
    id = s"/sport/cricket/match/$matchId/${team.wordsForUrl}",
    section = Some(SectionId.fromId("cricket")),
    webTitle = s"${theMatch.competitionName}, ${theMatch.venueName}",
  )
}

class CricketMatchController(cricketStatsJob: CricketStatsJob, val controllerComponents: ControllerComponents)(implicit
    context: ApplicationContext,
) extends BaseController
    with GuLogging
    with ImplicitControllerExecutionContext {

  def renderMatchIdJson(date: String, teamId: String): Action[AnyContent] = renderMatchId(date, teamId)

  def renderMatchScoreboardJson(date: String, teamId: String): Action[AnyContent] =
    Action { implicit request =>
      CricketTeams
        .byWordsForUrl(teamId)
        .flatMap { team =>
          cricketStatsJob.findMatch(team, date).map { matchData =>
            val page = CricketMatchPage(matchData, date, team)
            Cached(60) {
              JsonComponent(
                "match" -> Json.toJson(page.theMatch),
                "scorecardUrl" -> (Configuration.site.host + page.metadata.id),
              )
            }
          }
        }
        .getOrElse(NoCache(NotFound))
    }
  def renderMatchId(date: String, teamId: String): Action[AnyContent] =
    Action { implicit request =>
      CricketTeams
        .byWordsForUrl(teamId)
        .flatMap { team =>
          cricketStatsJob.findMatch(team, date).map { matchData =>
            val page = CricketMatchPage(matchData, date, team)
            Cached(60) {
              if (request.isJson && request.forceDCR) {
                val model = DotcomRenderingCricketDataModel(page)

                JsonComponent.fromWritable(model)
              } else if (request.isJson)
                JsonComponent(
                  "summary" -> cricket.views.html.fragments
                    .cricketMatchSummary(page.theMatch, page.metadata.id)
                    .toString,
                )
              else
                RevalidatableResult.Ok(cricket.views.html.cricketMatch(page))
            }
          }
        }
        .getOrElse(NoCache(NotFound))
    }

}
