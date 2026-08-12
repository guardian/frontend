package football.model

import common.LinkTo
import conf.Configuration
import implicits.Football.MatchHelpers
import model.TeamColours
import pa.{FootballMatch, LineUpEnhanced, LineUpTeamEnhanced, MatchDayTeam}
import play.api.libs.json.{Json, Writes}
import play.api.mvc.RequestHeader

case class PlayerEvent(eventTime: String, eventType: String)

case class PlayerEventEnhanced(eventId: String, eventType: String, normalTime: String, addedTime: String)

case class Player(
    id: String,
    name: String,
    position: String,
    lastName: String,
    substitute: Boolean,
    timeOnPitch: String,
    shirtNumber: String,
    events: Seq[PlayerEvent],
    enhancedEvents: Seq[PlayerEventEnhanced],
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
    substitutions: Seq[Substitution],
)

case class MatchStats(
    id: String,
    homeTeam: TeamStats,
    awayTeam: TeamStats,
    comments: Option[String],
    status: String,
)

case class Substitution(
    eventId: String,
    name: String,
    lastName: String,
)

object MatchStats {
  val reportedEventTypes = List("booking", "dismissal", "substitution")

  def makePlayers(team: LineUpTeamEnhanced): Seq[Player] = {
    team.players.map { player =>
      val events = player.events.filter(event => MatchStats.reportedEventTypes.contains(event.eventType)).map { event =>
        PlayerEvent(event.normalTime, event.eventType)
      }
      val enhancedEvents =
        player.events.filter(event => MatchStats.reportedEventTypes.contains(event.eventType)).map { event =>
          PlayerEventEnhanced(event.eventID, event.eventType, event.normalTime, event.addedTime)
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
        enhancedEvents,
      )
    }
  }

  def makeTeamStats(
      teamV1: MatchDayTeam,
      teamV2: LineUpTeamEnhanced,
      teamPossession: Int,
      teamColour: String,
  ): TeamStats = {
    val players = makePlayers(teamV2)
    val substitutions: Seq[Substitution] = players
      .filter((p) => p.substitute)
      .flatMap((player) =>
        player.enhancedEvents
          .find(_.eventType == "substitution")
          .map((sub) =>
            Substitution(
              eventId = sub.eventId,
              name = player.name,
              lastName = player.lastName,
            ),
          ),
      )

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
      substitutions = substitutions,
    )
  }

  def statsFromFootballMatch(theMatch: FootballMatch, lineUp: LineUpEnhanced, matchStatus: String): MatchStats = {
    val teamColours = TeamColours(lineUp.homeTeam, lineUp.awayTeam)
    MatchStats(
      theMatch.id,
      makeTeamStats(theMatch.homeTeam, lineUp.homeTeam, lineUp.homeTeamPossession, teamColours.home),
      makeTeamStats(theMatch.awayTeam, lineUp.awayTeam, lineUp.awayTeamPossession, teamColours.away),
      theMatch.comments,
      matchStatus,
    )
  }

  implicit val PlayerEventWrites: Writes[PlayerEvent] = Json.writes[PlayerEvent]
  implicit val PlayerEventEnhancedWrites: Writes[PlayerEventEnhanced] = Json.writes[PlayerEventEnhanced]
  implicit val SubstitutionWrites: Writes[Substitution] = Json.writes[Substitution]
  implicit val PlayerWrites: Writes[Player] = Json.writes[Player]
  implicit val TeamStatsWrites: Writes[TeamStats] = Json.writes[TeamStats]
  implicit val MatchStatsWrites: Writes[MatchStats] = Json.writes[MatchStats]

}

case class TeamStatsSummary(
    id: String,
    name: String,
    possession: Int,
    shotsOn: Int,
    shotsOff: Int,
    colours: String,
)

case class MatchStatsSummary(
    id: String,
    homeTeam: TeamStatsSummary,
    awayTeam: TeamStatsSummary,
    status: String,
    infoURL: String,
)

object MatchStatsSummary {
  def makeTeamStatsSummary(
      teamV1: MatchDayTeam,
      teamV2: LineUpTeamEnhanced,
      teamPossession: Int,
      teamColour: String,
  ): TeamStatsSummary = {
    TeamStatsSummary(
      id = teamV1.id,
      name = teamV1.name,
      possession = teamPossession,
      shotsOn = teamV2.shotsOn,
      shotsOff = teamV2.shotsOff,
      colours = teamColour,
    )
  }
  def statsSummaryFromFootballMatch(theMatch: FootballMatch, lineUp: LineUpEnhanced)(implicit
      request: RequestHeader,
  ): MatchStatsSummary = {
    val teamColours = TeamColours(lineUp.homeTeam, lineUp.awayTeam)
    val matchInfo: FootballMatchTrail = FootballMatchTrail.toTrail(theMatch)
    MatchStatsSummary(
      id = theMatch.id,
      homeTeam = makeTeamStatsSummary(theMatch.homeTeam, lineUp.homeTeam, lineUp.homeTeamPossession, teamColours.home),
      awayTeam = makeTeamStatsSummary(theMatch.awayTeam, lineUp.awayTeam, lineUp.awayTeamPossession, teamColours.away),
      status = theMatch.matchStatus,
      infoURL = LinkTo(matchInfo.url),
    )
  }

  implicit val TeamStatsSummaryWrites: Writes[TeamStatsSummary] = Json.writes[TeamStatsSummary]
  implicit val MatchStatsSummaryWrites: Writes[MatchStatsSummary] = Json.writes[MatchStatsSummary]
}
