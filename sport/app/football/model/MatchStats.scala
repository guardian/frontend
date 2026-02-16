package football.model

import conf.Configuration
import model.TeamColours
import pa.{FootballMatch, LineUp, LineUpTeam, MatchDayTeam}
import play.api.libs.json.{Json, Writes}

case class PlayerEvent(eventTime: String, eventType: String)
case class Player(
    id: String,
    name: String,
    position: String,
    lastName: String,
    substitute: Boolean,
    timeOnPitch: String,
    shirtNumber: String,
    events: Seq[PlayerEvent],
)
case class TeamStats(
    id: String,
    name: String,
    players: Seq[Player],
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
)

case class MatchStats(
    id: String,
    homeTeam: TeamStats,
    awayTeam: TeamStats,
    comments: Option[String],
    status: String,
)

object MatchStats {
  val reportedEventTypes = List("booking", "dismissal", "substitution")

  def makePlayers(team: LineUpTeam): Seq[Player] = {
    team.players.map { player =>
      val events = player.events.filter(event => MatchStats.reportedEventTypes.contains(event.eventType)).map { event =>
        PlayerEvent(event.eventTime, event.eventType)
      }
      Player(
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

  def makeTeamAnswer(teamV1: MatchDayTeam, teamV2: LineUpTeam, teamPossession: Int, teamColour: String): TeamStats = {
    val players = makePlayers(teamV2)
    TeamStats(
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

  def statsFromFootballMatch(theMatch: FootballMatch, lineUp: LineUp, matchStatus: String): MatchStats = {
    val teamColours = TeamColours(lineUp.homeTeam, lineUp.awayTeam)
    MatchStats(
      theMatch.id,
      makeTeamAnswer(theMatch.homeTeam, lineUp.homeTeam, lineUp.homeTeamPossession, teamColours.home),
      makeTeamAnswer(theMatch.awayTeam, lineUp.awayTeam, lineUp.awayTeamPossession, teamColours.away),
      theMatch.comments,
      matchStatus,
    )
  }

  implicit val PlayerEventWrites: Writes[PlayerEvent] = Json.writes[PlayerEvent]
  implicit val PlayerWrites: Writes[Player] = Json.writes[Player]
  implicit val TeamStatsWrites: Writes[TeamStats] = Json.writes[TeamStats]
  implicit val MatchStatsWrites: Writes[MatchStats] = Json.writes[MatchStats]
}
