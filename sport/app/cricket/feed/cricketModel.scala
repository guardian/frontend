package cricketModel

import play.api.libs.json._
import java.time.LocalDateTime

case class Team(name: String, id: String, home: Boolean, lineup: List[String])

object Team {
  implicit val writes: OWrites[Team] = Json.writes[Team]
}

case class InningsBatter(
    name: String,
    order: Int,
    ballsFaced: Int,
    runs: Int,
    fours: Int,
    sixes: Int,
    out: Boolean,
    howOut: String,
    onStrike: Boolean,
    nonStrike: Boolean,
) {
  lazy val notOut: Boolean = !out
}

object InningsBatter {
  implicit val writes: OWrites[InningsBatter] = Json.writes[InningsBatter]
}

case class InningsBowler(name: String, order: Int, overs: Int, maidens: Int, runs: Int, wickets: Int)

object InningsBowler {
  implicit val writes: OWrites[InningsBowler] = Json.writes[InningsBowler]
}

case class InningsWicket(order: Int, name: String, runs: Int)

object InningsWicket {
  implicit val writes: OWrites[InningsWicket] = Json.writes[InningsWicket]
}

case class Innings(
    order: Int,
    battingTeam: String,
    runsScored: Int,
    overs: String,
    declared: Boolean,
    forfeited: Boolean,
    description: String,
    batsmen: List[InningsBatter],
    bowlers: List[InningsBowler],
    fallOfWicket: List[InningsWicket],
    byes: Int,
    legByes: Int,
    noBalls: Int,
    penalties: Int,
    wides: Int,
    extras: Int,
) {
  implicit val writes: OWrites[Innings] = Json.writes[Innings]
  lazy val closed = declared || forfeited || allOut
  lazy val allOut = wickets == 10
  lazy val wickets = fallOfWicket.length

  lazy val firstIn: Option[InningsBatter] = batsmen.find(_.notOut)
  lazy val secondIn: Option[InningsBatter] = {
    batsmen.filter(_.notOut) match {
      case first :: second :: _ => Some(second)
      case _                    => None
    }
  }
  lazy val lastOut: Option[InningsBatter] = batsmen.filter(_.out).lastOption
}

object Innings {
  implicit val writes: OWrites[Innings] = Json.writes[Innings]
}

case class Match(
    teams: List[Team],
    innings: List[Innings],
    competitionName: String,
    venueName: String,
    result: String,
    gameDate: LocalDateTime,
    officials: List[String],
    matchId: String,
) {
  def homeTeam: Team = teams.filter(_.home).head
  def awayTeam: Team = teams.filter(!_.home).head
  def homeTeamInnings: List[Innings] = innings.filter(x => x.battingTeam == homeTeam.name).sortBy(_.order)
  def awayTeamInnings: List[Innings] = innings.filter(x => x.battingTeam == awayTeam.name).sortBy(_.order)

  def lastInnings: Option[Innings] = innings.lastOption

  def firstInBatter: Option[InningsBatter] = lastInnings.flatMap(_.firstIn)

  def secondInBatter: Option[InningsBatter] = lastInnings.flatMap(_.secondIn)

  def lastOut: Option[InningsBatter] = lastInnings.flatMap(_.lastOut)
}

object Match {
  implicit val writes: OWrites[Match] = Json.writes[Match]
}
