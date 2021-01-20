package cricketModel

import org.joda.time.DateTime

case class Match(
    teams: List[Team],
    innings: List[Innings],
    competitionName: String,
    venueName: String,
    result: String,
    gameDate: DateTime,
    officials: List[String],
    matchId: String,
) {
  def homeTeam: Team = teams.filter(_.home).head
  def awayTeam: Team = teams.filter(!_.home).head
  def homeTeamInnings: List[Innings] = innings.filter(x => x.battingTeam == homeTeam.name).sortBy(_.order)
  def awayTeamInnings: List[Innings] = innings.filter(x => x.battingTeam == awayTeam.name).sortBy(_.order)

  def lastInnings: Option[Innings] = innings.lastOption

  def firstInBatsman: Option[InningsBatsman] = lastInnings.flatMap(_.firstIn)

  def secondInBatsman: Option[InningsBatsman] = lastInnings.flatMap(_.secondIn)

  def lastOut: Option[InningsBatsman] = lastInnings.flatMap(_.lastOut)
}

case class Team(name: String, id: String, home: Boolean, lineup: List[String])

case class Innings(
    order: Int,
    battingTeam: String,
    runsScored: Int,
    overs: String,
    declared: Boolean,
    forfeited: Boolean,
    description: String,
    batsmen: List[InningsBatsman],
    bowlers: List[InningsBowler],
    fallOfWicket: List[InningsWicket],
    byes: Int,
    legByes: Int,
    noBalls: Int,
    penalties: Int,
    wides: Int,
    extras: Int,
) {
  lazy val closed = declared || forfeited || allOut
  lazy val allOut = wickets == 10
  lazy val wickets = fallOfWicket.length

  lazy val firstIn: Option[InningsBatsman] = batsmen.find(_.notOut)
  lazy val secondIn: Option[InningsBatsman] = {
    batsmen.filter(_.notOut) match {
      case first :: second :: _ => Some(second)
      case _                    => None
    }
  }
  lazy val lastOut: Option[InningsBatsman] = batsmen.filter(_.out).lastOption
}

case class InningsBatsman(
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

case class InningsBowler(name: String, order: Int, overs: Int, maidens: Int, runs: Int, wickets: Int)

case class InningsWicket(order: Int, name: String, runs: Int)
