package football.controllers

import common._
import feed.CompetitionsService
import implicits.{Football, HtmlFormat, JsonFormat, Requests}
import model.Cached.{RevalidatableResult, WithoutRevalidationResult}
import model.TeamMap.findTeamIdByUrlName
import football.datetime.DateHelpers
import model._
import pa.{FootballMatch, LineUp, LineUpTeam, MatchDayTeam}
import play.api.libs.json._
import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents}
import conf.Configuration
import football.model.{DotcomRenderingFootballMatchSummaryDataModel, GuTeamCodes}
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

sealed trait NsAnswer

case class EventAnswer(eventTime: String, eventType: String) extends NsAnswer
case class PlayerAnswer(
    id: String,
    name: String,
    position: String,
    lastName: String,
    substitute: Boolean,
    timeOnPitch: String,
    shirtNumber: String,
    events: Seq[EventAnswer],
) extends NsAnswer
case class TeamAnswer(
    id: String,
    name: String,
    players: Seq[PlayerAnswer],
    score: Option[Int],
    scorers: List[String],
    possession: Int,
    shotsOn: Int,
    shotsOff: Int,
    corners: Int,
    fouls: Int,
    colours: String,
    crest: String,
    codename: String,
) extends NsAnswer

case class MatchDataAnswer(
    id: String,
    homeTeam: TeamAnswer,
    awayTeam: TeamAnswer,
    comments: Option[String],
    status: String,
) extends NsAnswer

object NsAnswer {
  val reportedEventTypes = List("booking", "dismissal", "substitution")

  def makePlayers(team: LineUpTeam): Seq[PlayerAnswer] = {
    team.players.map { player =>
      val events = player.events.filter(event => NsAnswer.reportedEventTypes.contains(event.eventType)).map { event =>
        EventAnswer(event.eventTime, event.eventType)
      }
      PlayerAnswer(
        player.id,
        player.name,
        player.position,
        player.lastName,
        player.substitute,
        player.timeOnPitch,
        player.shirtNumber,
        events,
      )
    }
  }

  def makeTeamAnswer(teamV1: MatchDayTeam, teamV2: LineUpTeam, teamPossession: Int, teamColour: String): TeamAnswer = {
    val players = makePlayers(teamV2)
    TeamAnswer(
      teamV1.id,
      teamV1.name,
      players = players,
      score = teamV1.score,
      scorers = teamV1.scorers.fold(Nil: List[String])(_.split(",").toList),
      possession = teamPossession,
      shotsOn = teamV2.shotsOn,
      shotsOff = teamV2.shotsOff,
      corners = teamV2.corners,
      fouls = teamV2.fouls,
      colours = teamColour,
      crest = s"${Configuration.staticSport.path}/football/crests/120/${teamV1.id}.png",
      codename = GuTeamCodes.codeFor(teamV1),
    )
  }

  def makeFromFootballMatch(theMatch: FootballMatch, lineUp: LineUp, matchStatus: String): MatchDataAnswer = {
    val teamColours = TeamColours(lineUp.homeTeam, lineUp.awayTeam)
    MatchDataAnswer(
      theMatch.id,
      makeTeamAnswer(theMatch.homeTeam, lineUp.homeTeam, lineUp.homeTeamPossession, teamColours.home),
      makeTeamAnswer(theMatch.awayTeam, lineUp.awayTeam, lineUp.awayTeamPossession, teamColours.away),
      theMatch.comments,
      matchStatus,
    )
  }

  implicit val EventAnswerWrites: Writes[EventAnswer] = Json.writes[EventAnswer]
  implicit val PlayerAnswerWrites: Writes[PlayerAnswer] = Json.writes[PlayerAnswer]
  implicit val TeamAnswerWrites: Writes[TeamAnswer] = Json.writes[TeamAnswer]
  implicit val MatchDataAnswerWrites: Writes[MatchDataAnswer] = Json.writes[MatchDataAnswer]
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
            val matchStats = NsAnswer.makeFromFootballMatch(theMatch, page.lineUp, theMatch.matchStatus)

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
