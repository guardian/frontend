package cricket.controllers

import common._
import conf.Configuration
import cricketModel.Match
import conf.cricketPa.{CricketTeam, CricketTeams}
import football.model.{CricketScoreBoardDataModel, DotcomRenderingCricketDataModel}
import implicits.{HtmlFormat, JsonFormat}
import jobs.CricketStatsJob
import model.Cached.RevalidatableResult
import model._
import play.api.libs.json.Json
import play.api.libs.ws.WSClient
import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents, RequestHeader, Result}
import renderers.DotcomRenderingService
import services.dotcomrendering.{CricketPagePicker, RemoteRender}

import scala.concurrent.Future
import scala.concurrent.Future.successful

case class CricketMatchPage(theMatch: Match, matchId: String, team: CricketTeam) extends StandalonePage {
  override val metadata = MetaData.make(
    id = s"/sport/cricket/match/$matchId/${team.wordsForUrl}",
    section = Some(SectionId.fromId("cricket")),
    webTitle = s"${theMatch.competitionName}, ${theMatch.venueName}",
  )
}

class CricketMatchController(
    cricketStatsJob: CricketStatsJob,
    val controllerComponents: ControllerComponents,
    val wsClient: WSClient,
)(implicit
    context: ApplicationContext,
) extends BaseController
    with GuLogging
    with ImplicitControllerExecutionContext {
  val remoteRenderer: DotcomRenderingService = DotcomRenderingService()

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
                "match" -> CricketScoreBoardDataModel.toJson(page.theMatch),
                "scorecardUrl" -> (Configuration.site.host + page.metadata.id),
              )
            }
          }
        }
        .getOrElse(NoCache(NotFound))
    }

  def renderMatchId(date: String, teamId: String): Action[AnyContent] =
    Action.async { implicit request =>
      CricketTeams
        .byWordsForUrl(teamId)
        .flatMap { team =>
          cricketStatsJob.findMatch(team, date).map { matchData =>
            val page = CricketMatchPage(matchData, date, team)
            renderMatch(page)
          }
        }
        .getOrElse(successful(NoCache(NotFound)))
    }

  private def renderMatch(
      page: CricketMatchPage,
  )(implicit request: RequestHeader, context: ApplicationContext): Future[Result] = {
    val tier = CricketPagePicker.getTier()
    request.getRequestFormat match {
      case JsonFormat if request.forceDCR =>
        val model = DotcomRenderingCricketDataModel(page)
        successful(Cached(CacheTime.Cricket)(JsonComponent.fromWritable(model)))
      case JsonFormat =>
        successful(Cached(CacheTime.Cricket) {
          JsonComponent(
            "summary" -> cricket.views.html.fragments
              .cricketMatchSummary(page.theMatch, page.metadata.id)
              .toString,
          )
        })
      case HtmlFormat if tier == RemoteRender =>
        val model = DotcomRenderingCricketDataModel(page)
        remoteRenderer.getCricketPage(wsClient, DotcomRenderingCricketDataModel.toJson(model))
      case _ =>
        successful(Cached(CacheTime.Cricket) {
          RevalidatableResult.Ok(cricket.views.html.cricketMatch(page))
        })
    }
  }
}
