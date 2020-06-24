package football.controllers

import common._
import feed.CompetitionsService
import implicits.{Football, Requests}
import model.Cached.WithoutRevalidationResult
import model.TeamMap.findTeamIdByUrlName
import model._
import org.joda.time.format.DateTimeFormat
import pa.{FootballMatch, LineUp, LineUpTeam, MatchDayTeam}
import play.api.libs.json._
import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents}
import conf.Configuration

import scala.concurrent.Future

case class MatchPage(theMatch: FootballMatch, lineUp: LineUp) extends StandalonePage with Football {
  lazy val matchStarted = theMatch.isLive || theMatch.isResult
  lazy val hasLineUp = lineUp.awayTeam.players.nonEmpty && lineUp.homeTeam.players.nonEmpty

  def teamHasStats(team: LineUpTeam): Boolean =
    ( team.offsides, team.shotsOn, team.shotsOff, team.fouls) match {
      case (0,0,0,0) => false
      case _ => true
    }

  lazy val hasPaStats: Boolean = teamHasStats( lineUp.homeTeam ) && teamHasStats( lineUp.awayTeam )

  private val id = MatchUrl(theMatch)

  private val javascriptConfig: Map[String, JsValue] = Map(
    "footballMatch" -> JsObject(Seq(
      "id" -> JsString(theMatch.id),
      "dateInMillis" -> JsNumber(theMatch.date.getMillis),
      "homeTeam" -> JsString(theMatch.homeTeam.id),
      "awayTeam" -> JsString(theMatch.awayTeam.id),
      "isLive" -> JsBoolean(theMatch.isLive)
    ))
  )
  override val metadata = MetaData.make(
    id = id,
    section = Some(SectionId.fromId("football")),
    webTitle = s"${theMatch.homeTeam.name} ${theMatch.homeTeam.score.getOrElse("")} - ${theMatch.awayTeam.score.getOrElse("")} ${theMatch.awayTeam.name}",
    javascriptConfigOverrides = javascriptConfig
  )
}

sealed trait NsAnswer

case class EventAnswer(eventTime: String, eventType: String) extends NsAnswer
case class PlayerAnswer(id: String, name: String, position: String, lastName: String, substitute: Boolean, timeOnPitch: String, shirtNumber: String, events: Seq[EventAnswer]) extends NsAnswer
case class TeamAnswer(
   id: String,
   name: String,
   players: Seq[PlayerAnswer],
   lineup: Seq[PlayerAnswer],
   score: Int,
   scorers: List[String],
   possession: Int,
   shotsOn: Int,
   shotsOff: Int,
   corners: Int,
   fouls: Int,
   colours: String,
   crest: String
) extends NsAnswer

case class MatchDataAnswer(id: String, homeTeam: TeamAnswer, awayTeam: TeamAnswer) extends NsAnswer

object NsAnswer {
  val reportedEventTypes = List("booking", "dismissal", "substitution")

  def makePlayers(team: LineUpTeam): Seq[PlayerAnswer] = {
    team.players.map{ player =>
      val events = player.events.filter(event => NsAnswer.reportedEventTypes.contains(event.eventType)).map { event =>
        EventAnswer(event.eventTime, event.eventType)
      }
      PlayerAnswer(player.id, player.name, player.position, player.lastName, player.substitute, player.timeOnPitch, player.shirtNumber, events)
    }
  }

  def makeTeamAnswer(teamV1: MatchDayTeam , teamV2: LineUpTeam, teamPossession: Int, teamColour: String): TeamAnswer = {
    val players = makePlayers(teamV2)
    TeamAnswer(
      teamV1.id,
      teamV1.name,
      players = players,
      lineup = players,
      score = teamV1.score.getOrElse(0),
      scorers = teamV1.scorers.fold(Nil: List[String])(_.split(",").toList),
      possession = teamPossession,
      shotsOn = teamV2.shotsOn,
      shotsOff = teamV2.shotsOff,
      corners = teamV2.corners,
      fouls = teamV2.fouls,
      colours = teamColour,
      crest = s"${Configuration.staticSport.path}/football/crests/120/${teamV1.id}.png"
    )
  }

  def makeFromFootballMatch(theMatch: FootballMatch, lineUp: LineUp): MatchDataAnswer = {
    val teamColours = TeamColours(lineUp.homeTeam, lineUp.awayTeam)
    MatchDataAnswer(
      theMatch.id,
      makeTeamAnswer(theMatch.homeTeam, lineUp.homeTeam, lineUp.homeTeamPossession, teamColours.home),
      makeTeamAnswer(theMatch.awayTeam, lineUp.awayTeam, lineUp.awayTeamPossession, teamColours.away)
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
  val controllerComponents: ControllerComponents
)(implicit context: ApplicationContext)
  extends BaseController with Football with Requests with Logging with ImplicitControllerExecutionContext {

  private val dateFormat = DateTimeFormat.forPattern("yyyyMMMdd")

  def renderMatchIdJson(matchId: String): Action[AnyContent] = renderMatchId(matchId)
  def renderMatchId(matchId: String): Action[AnyContent] = render(competitionsService.findMatch(matchId))

  def renderMatchJson(year: String, month: String, day: String, home: String, away: String): Action[AnyContent] = renderMatch(year, month, day, home, away)
  def renderMatch(year: String, month: String, day: String, home: String, away: String): Action[AnyContent] =
    (findTeamIdByUrlName(home), findTeamIdByUrlName(away)) match {
      case (Some(homeId), Some(awayId)) =>
        val date = dateFormat.parseDateTime(year + month + day).toLocalDate
        render(competitionsService.matchFor(date, homeId, awayId))
      case _ => render(None)
    }

  private def render(maybeMatch: Option[FootballMatch]): Action[AnyContent] = Action.async { implicit request =>
    val response = maybeMatch map { theMatch =>
      val lineup: Future[LineUp] = competitionsService.getLineup(theMatch)
      val page: Future[MatchPage] = lineup map { MatchPage(theMatch, _) }
      page map { page =>
        if (request.forceDCR) {
          Cached(30) {
            JsonComponent(Json.toJson(NsAnswer.makeFromFootballMatch(theMatch, page.lineUp)))
          }
        } else {
          val htmlResponse = () => football.views.html.matchStats.matchStatsPage(page, competitionsService.competitionForMatch(theMatch.id))
          val jsonResponse = () => football.views.html.matchStats.matchStatsComponent(page)
          renderFormat(htmlResponse, jsonResponse, page)
        }
      }
    }

    // we do not keep historical data, so just redirect old stuff to the results page (see also MatchController)
    response.getOrElse(Future.successful(Cached(30)(WithoutRevalidationResult(Found("/football/results")))))
  }
}
