package cricket.controllers

import common._
import conf.Configuration
import conf.cricketPa.{CricketTeam, CricketTeams, PaFeed}
import contentapi.ContentApiClient
import cricketModel.{Match, MatchHeader, MatchStatsSummary}
import football.datetime.DateHelpers
import football.model.{CricketScoreBoardDataModel, DotcomRenderingCricketDataModel}
import implicits.{HtmlFormat, JsonFormat}
import jobs.CricketStatsJob
import model.Cached.RevalidatableResult
import model._
import play.api.libs.ws.WSClient
import play.api.mvc._
import renderers.DotcomRenderingService
import services.dotcomrendering.{CricketPagePicker, RemoteRender}

import java.time.{LocalDate, ZoneId, ZonedDateTime}
import scala.concurrent.Future
import scala.concurrent.Future.successful
import model.dotcomrendering.DotcomRenderingUtils.isCricketMatchRelated

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
    contentApiClient: ContentApiClient,
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

  def matchHeaderJson(date: String, teamId: String): Action[AnyContent] =
    Action.async { implicit request =>
      CricketTeams
        .byWordsForUrl(teamId)
        .flatMap { team =>
          cricketStatsJob.findMatch(team, date).map { matchData =>
            val page = CricketMatchPage(matchData, date, team)
            val requestedDate: ZonedDateTime =
              LocalDate.parse(date, PaFeed.dateFormat).atStartOfDay(ZoneId.of("Europe/London"))
            val related: Future[Seq[ContentType]] = relatedContents(matchData, requestedDate)
            related.map { relatedContents =>
              val model = MatchHeader(page, relatedContents, requestedDate)
              Cached(CacheTime.Cricket)(JsonComponent.fromWritable(model))
            }
          }
        }
        .getOrElse(successful(NoCache(NotFound)))
    }

  def matchStatsSummaryJson(date: String, teamId: String): Action[AnyContent] =
    Action.async { implicit request =>
      CricketTeams
        .byWordsForUrl(teamId)
        .flatMap { team =>
          cricketStatsJob.findMatch(team, date).map { matchData =>
            val summary = MatchStatsSummary(matchData)
            successful(Cached(CacheTime.Cricket)(JsonComponent.fromWritable(summary)))
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

  private def relatedContents(theMatch: Match, date: ZonedDateTime): Future[List[ContentType]] = {
    val startOfDateRange = DateHelpers.startOfDay(date)
    val endOfDateRange = DateHelpers.startOfDay(date.plusDays(1))
    val tagIds = theMatch.teams.flatMap(_.teamTagId).mkString(",")

    contentApiClient
      .getResponse(
        contentApiClient
          .search()
          .section("sport")
          .tag(
            s"sport/cricket,$tagIds",
          )
          .fromDate(startOfDateRange.toInstant)
          .toDate(endOfDateRange.toInstant),
      )
      .map { response =>
        response.results
          .map(Content(_))
          .toList
          .filter(c => isCricketMatchRelated(c))
      }
  }
}
