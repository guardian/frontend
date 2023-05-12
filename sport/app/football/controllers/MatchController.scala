package football.controllers

import common._
import feed.CompetitionsService
import implicits.{Football, Requests}
import model.Cached.WithoutRevalidationResult
import model.TeamMap.findTeamIdByUrlName
import football.datetime.DateHelpers
import model._
import pa.{FootballMatch, LineUp, LineUpPlayer, LineUpTeam, MatchDayTeam, MatchEvents}
import play.api.libs.json._
import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents}
import conf.Configuration

import java.time.LocalDate
import java.time.format.DateTimeFormatter
import scala.concurrent.Future

case class MatchPage(
    theMatch: FootballMatch,
    lineUp: LineUp,
    homePlayerAndSubstitute: Option[Map[String, LineUpPlayer]],
    awayPlayerAndSubstitute: Option[Map[String, LineUpPlayer]],
) extends StandalonePage
    with Football {
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
    substitutedBy: Option[PlayerAnswer],
) extends NsAnswer
case class TeamAnswer(
    id: String,
    name: String,
    players: Seq[PlayerAnswer],
    score: Int,
    scorers: List[String],
    possession: Int,
    shotsOn: Int,
    shotsOff: Int,
    corners: Int,
    fouls: Int,
    colours: String,
    crest: String,
) extends NsAnswer

case class MatchDataAnswer(id: String, homeTeam: TeamAnswer, awayTeam: TeamAnswer) extends NsAnswer

object NsAnswer {
  val reportedEventTypes = List("booking", "dismissal", "substitution")

  def makePlayers(team: LineUpTeam, playerAndSubstitute: Option[Map[String, LineUpPlayer]]): Seq[PlayerAnswer] = {
    team.players.map { player =>
      val events = player.events.filter(event => NsAnswer.reportedEventTypes.contains(event.eventType)).map { event =>
        EventAnswer(event.eventTime, event.eventType)
      }

      val subPlayer = for {
        playerAndSubs <- playerAndSubstitute
        substitutedPlayer <- playerAndSubs.get(player.id)
      } yield {
        val events =
          substitutedPlayer.events.filter(event => NsAnswer.reportedEventTypes.contains(event.eventType)).map { event =>
            EventAnswer(event.eventTime, event.eventType)
          }

        PlayerAnswer(
          substitutedPlayer.id,
          substitutedPlayer.name,
          substitutedPlayer.position,
          substitutedPlayer.lastName,
          substitutedPlayer.substitute,
          substitutedPlayer.timeOnPitch,
          substitutedPlayer.shirtNumber,
          events,
          None,
        )
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
        subPlayer,
      )
    }
  }

  def getPlayerSubs(substitutedBy: Option[Map[String, String]], subs: Seq[LineUpPlayer], player: LineUpPlayer) = {
    substitutedBy flatMap { s =>
      for {
        subbedById <- s.get(player.id)
        player <- subs.find(_.id == subbedById)
      } yield {
        val events = player.events.filter(event => NsAnswer.reportedEventTypes.contains(event.eventType)).map { event =>
          EventAnswer(event.eventTime, event.eventType)
        }
        NxPlayer(
          id = player.id,
          name = player.name,
          position = player.position,
          lastName = player.lastName,
          substitute = player.substitute,
          timeOnPitch = player.timeOnPitch,
          shirtNumber = player.shirtNumber,
          events = events,
        )
      }
    }
  }

  def makeTeamAnswer(
      teamV1: MatchDayTeam,
      teamV2: LineUpTeam,
      teamPossession: Int,
      teamColour: String,
      playerAndSubstitute: Option[Map[String, LineUpPlayer]],
  ): TeamAnswer = {
    val players = makePlayers(teamV2, playerAndSubstitute)
    TeamAnswer(
      teamV1.id,
      teamV1.name,
      players = players,
      score = teamV1.score.getOrElse(0),
      scorers = teamV1.scorers.fold(Nil: List[String])(_.split(",").toList),
      possession = teamPossession,
      shotsOn = teamV2.shotsOn,
      shotsOff = teamV2.shotsOff,
      corners = teamV2.corners,
      fouls = teamV2.fouls,
      colours = teamColour,
      crest = s"${Configuration.staticSport.path}/football/crests/120/${teamV1.id}.png",
    )
  }

  def makeFromFootballMatch(
      theMatch: FootballMatch,
      lineUp: LineUp,
      homePlayerAndSubstitute: Option[Map[String, LineUpPlayer]],
      awayPlayerAndSubstitute: Option[Map[String, LineUpPlayer]],
  ): MatchDataAnswer = {
    val teamColours = TeamColours(lineUp.homeTeam, lineUp.awayTeam)
    MatchDataAnswer(
      theMatch.id,
      makeTeamAnswer(
        theMatch.homeTeam,
        lineUp.homeTeam,
        lineUp.homeTeamPossession,
        teamColours.home,
        homePlayerAndSubstitute,
      ),
      makeTeamAnswer(
        theMatch.awayTeam,
        lineUp.awayTeam,
        lineUp.awayTeamPossession,
        teamColours.away,
        awayPlayerAndSubstitute,
      ),
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
    val controllerComponents: ControllerComponents,
)(implicit context: ApplicationContext)
    extends BaseController
    with Football
    with Requests
    with GuLogging
    with ImplicitControllerExecutionContext {

  def renderMatchIdJson(matchId: String): Action[AnyContent] = renderMatchId(matchId)
  def renderMatchId(matchId: String): Action[AnyContent] = render(competitionsService.findMatch(matchId))

  def renderMatchJson(year: String, month: String, day: String, home: String, away: String): Action[AnyContent] =
    renderMatch(year, month, day, home, away)
  def renderMatch(year: String, month: String, day: String, home: String, away: String): Action[AnyContent] =
    (findTeamIdByUrlName(home), findTeamIdByUrlName(away)) match {
      case (Some(homeId), Some(awayId)) =>
        val formatter = DateTimeFormatter.ofPattern("yyyyMMMdd").withZone(DateHelpers.defaultFootballZoneId)
        val date = LocalDate.parse(s"$year${month.capitalize}$day", formatter)
        val startOfDay = date.atStartOfDay(DateHelpers.defaultFootballZoneId)
        val startOfTomorrow = startOfDay.plusDays(1)
        render(competitionsService.matchFor(Interval(startOfDay, startOfTomorrow), homeId, awayId))
      case _ => render(None)
    }

  private def getListOfSubstitutes(lineUp: LineUpTeam, maybeMatchEvents: Option[MatchEvents]) = {
    maybeMatchEvents map { matchEvents =>
      val substitutionEvents = matchEvents.events filter { event =>
        event.eventType == "substitution" && event.teamID.contains(lineUp.id)
      }
      val substitutes: Seq[LineUpPlayer] = lineUp.players.filter(_.substitute)

      val playerAndSubs: Seq[(String, LineUpPlayer)] = substitutionEvents flatMap { event =>
        {
          val subPlayer = substitutes.find(_.id == event.players.head.id)
          subPlayer.map(s => event.players.last.id -> s)
        }
      }

      playerAndSubs.toMap
    }
  }

  private def render(maybeMatch: Option[FootballMatch]): Action[AnyContent] =
    Action.async { implicit request =>
      val response = maybeMatch map { theMatch =>
        val lineupFuture = competitionsService.getLineup(theMatch)
        val matchEventsFuture = competitionsService.getMatchEvents(theMatch)
        val page = for {
          lineup <- lineupFuture
          matchEvents <- matchEventsFuture
        } yield {
          val homePlayerAndSubstitute: Option[Map[String, LineUpPlayer]] =
            getListOfSubstitutes(lineup.homeTeam, matchEvents)
          val awayPlayerAndSubstitute: Option[Map[String, LineUpPlayer]] =
            getListOfSubstitutes(lineup.awayTeam, matchEvents)

          MatchPage(theMatch, lineup, homePlayerAndSubstitute, awayPlayerAndSubstitute)
        }
        page map { page =>
          if (request.forceDCR) {
            Cached(30) {
              JsonComponent.fromWritable(
                NsAnswer.makeFromFootballMatch(
                  theMatch,
                  page.lineUp,
                  page.homePlayerAndSubstitute,
                  page.awayPlayerAndSubstitute,
                ),
              )
            }
          } else {
            val htmlResponse = () =>
              football.views.html.matchStats.matchStatsPage(page, competitionsService.competitionForMatch(theMatch.id))
            val jsonResponse = () => football.views.html.matchStats.matchStatsComponent(page)
            renderFormat(htmlResponse, jsonResponse, page)
          }
        }
      }

      // we do not keep historical data, so just redirect old stuff to the results page (see also MatchController)
      response.getOrElse(Future.successful(Cached(30)(WithoutRevalidationResult(Found("/football/results")))))
    }
}
