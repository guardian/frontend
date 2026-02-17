package football.controllers

import common._
import feed.CompetitionsService
import implicits.{Football, HtmlFormat, JsonFormat, Requests}
import model.Cached.{RevalidatableResult, WithoutRevalidationResult}
import model.TeamMap.findTeamIdByUrlName
import football.datetime.DateHelpers
import model._
import pa.{FootballMatch, LineUp, LineUpTeam}
import play.api.libs.json._
import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents}
import football.model.{DotcomRenderingFootballMatchSummaryDataModel, MatchStats}
import play.api.libs.ws.WSClient
import renderers.DotcomRenderingService
import services.dotcomrendering.{FootballSummaryPagePicker, RemoteRender}

import java.time.LocalDate
import java.time.format.DateTimeFormatter
import scala.concurrent.Future

case class MatchPage(theMatch: FootballMatch, lineUp: LineUp) extends StandalonePage with Football {
  lazy val matchStarted = theMatch.isLive || theMatch.isResult
  lazy val hasLineUp = lineUp.awayTeam.players.nonEmpty && lineUp.homeTeam.players.nonEmpty

  def teamHasStats(team: LineUpTeam): Boolean =
    (team.offsides, team.shotsOn, team.shotsOff, team.fouls) match {
      case (0, 0, 0, 0) => false
      case _            => true
    }

  lazy val hasPaStats: Boolean = teamHasStats(lineUp.homeTeam) && teamHasStats(lineUp.awayTeam)

  private val id = MatchUrl(theMatch)

  private val javascriptConfig: Map[String, JsValue] = Map(
    "footballMatch" -> JsObject(
      Seq(
        "id" -> JsString(theMatch.id),
        "dateInMillis" -> JsNumber(theMatch.date.toInstant.toEpochMilli),
        "homeTeam" -> JsString(theMatch.homeTeam.id),
        "awayTeam" -> JsString(theMatch.awayTeam.id),
        "isLive" -> JsBoolean(theMatch.isLive),
      ),
    ),
  )
  override val metadata = MetaData.make(
    id = id,
    section = Some(SectionId.fromId("football")),
    webTitle = s"${theMatch.homeTeam.name} ${theMatch.homeTeam.score.getOrElse("")} - ${theMatch.awayTeam.score
        .getOrElse("")} ${theMatch.awayTeam.name}",
    javascriptConfigOverrides = javascriptConfig,
  )
}

// --------------------------------------------------------------

class MatchController(
    competitionsService: CompetitionsService,
    val wsClient: WSClient,
    val controllerComponents: ControllerComponents,
)(implicit context: ApplicationContext)
    extends BaseController
    with Football
    with Requests
    with GuLogging
    with ImplicitControllerExecutionContext {
  val remoteRenderer: DotcomRenderingService = DotcomRenderingService()

  def renderMatchIdJson(matchId: String): Action[AnyContent] = renderMatchId(matchId)
  def renderMatchId(matchId: String): Action[AnyContent] = render(competitionsService.findCompetitionMatch(matchId))

  def renderMatchJson(year: String, month: String, day: String, home: String, away: String): Action[AnyContent] =
    renderMatch(year, month, day, home, away)
  def renderMatch(year: String, month: String, day: String, home: String, away: String): Action[AnyContent] =
    (findTeamIdByUrlName(home), findTeamIdByUrlName(away)) match {
      case (Some(homeId), Some(awayId)) =>
        val formatter = DateTimeFormatter.ofPattern("yyyyMMMdd").withZone(DateHelpers.defaultFootballZoneId)
        val date = LocalDate.parse(s"$year${month.capitalize}$day", formatter)
        val startOfDay = date.atStartOfDay(DateHelpers.defaultFootballZoneId)
        val startOfTomorrow = startOfDay.plusDays(1)
        render(competitionsService.competitionMatchFor(Interval(startOfDay, startOfTomorrow), homeId, awayId))
      case _ => render(None)
    }

  private def render(maybeMatch: Option[(CompetitionSummary, FootballMatch)]): Action[AnyContent] =
    Action.async { implicit request =>
      maybeMatch match {
        case Some((competitionSummary, theMatch)) =>
          val group = tableGroupForMatch(competitionSummary.id, theMatch)
          val lineup: Future[LineUp] = competitionsService.getLineup(theMatch)
          val page: Future[MatchPage] = lineup.map(MatchPage(theMatch, _))
          val tier = FootballSummaryPagePicker.getTier()

          page.flatMap { page =>
            val matchStats = MatchStats.statsFromFootballMatch(theMatch, page.lineUp, theMatch.matchStatus)

            request.getRequestFormat match {
              case JsonFormat if request.forceDCR =>
                val model = DotcomRenderingFootballMatchSummaryDataModel(
                  page = page,
                  matchStats = matchStats,
                  matchInfo = theMatch,
                  group = group,
                  competitionName = competitionSummary.fullName,
                )
                Future.successful(Cached(CacheTime.FootballMatch)(JsonComponent.fromWritable(model)))

              case JsonFormat =>
                Future.successful(Cached(CacheTime.FootballMatch) {
                  JsonComponent(football.views.html.matchStats.matchStatsComponent(page))
                })

              case HtmlFormat if tier == RemoteRender =>
                val model = DotcomRenderingFootballMatchSummaryDataModel(
                  page = page,
                  matchStats = matchStats,
                  matchInfo = theMatch,
                  group = group,
                  competitionName = competitionSummary.fullName,
                )
                remoteRenderer.getFootballMatchSummaryPage(
                  wsClient,
                  DotcomRenderingFootballMatchSummaryDataModel.toJson(model),
                )

              case _ =>
                Future.successful(Cached(CacheTime.FootballMatch) {
                  RevalidatableResult.Ok(
                    football.views.html.matchStats
                      .matchStatsPage(page, competitionsService.competitionForMatch(theMatch.id)),
                  )
                })
            }
          }
        case None =>
          Future.successful(Cached(CacheTime.FootballMatch)(WithoutRevalidationResult(Found("/football/results"))))
      }
    }

  private def tableGroupForMatch(competitionId: String, theMatch: FootballMatch): Option[Group] =
    competitionsService.competitions
      .find(_.id == competitionId)
      .filter(_.hasLeagueTable)
      .map(Table(_))
      .flatMap { table =>
        table.groups.find(group => group.hasTeam(theMatch.homeTeam.id) && group.hasTeam(theMatch.awayTeam.id))
      }
}
