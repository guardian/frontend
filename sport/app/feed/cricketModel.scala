package cricketModel

import org.joda.time.DateTime

case class Match(
  teams: List[Team],
  innings: List[Innings],
  competitionName: String,
  description: String,
  venueName: String,
  result: String,
  gameDate: DateTime,
  officials: List[String])
{
  def homeTeam: Team = teams.filter(_.homeOrAway == "home").head
  def awayTeam: Team = teams.filter(_.homeOrAway == "away").head
  def homeTeamInnings: List[Innings] = innings.filter(x => x.battingTeamId == homeTeam.id).sortBy(_.id)
  def awayTeamInnings: List[Innings] = innings.filter(x => x.battingTeamId == awayTeam.id).sortBy(_.id)

  def lastInnings: Option[Innings] = innings.lastOption

  def firstInBatsman: Option[InningsBatsman] = lastInnings.flatMap( _.firstIn )

  def secondInBatsman: Option[InningsBatsman] = lastInnings.flatMap( _.secondIn )

  def lastOut: Option[InningsBatsman] = lastInnings.flatMap( _.lastOut )

  def bowlerOnStrike: Option[InningsBowler] = lastInnings.flatMap( _.currentBowler )
}

case class Team(
  name: String,
  id: Int,
  homeOrAway: String,
  lineup: List[String])

case class Innings(
  id: Int,
  battingTeamId: Int,
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
  extras: Int)
{
  lazy val closed = declared || forfeited || allOut
  lazy val allOut = wickets == 10
  lazy val wickets = fallOfWicket.length

  lazy val firstIn: Option[InningsBatsman] = batsmen.find( _.notOut )
  lazy val secondIn: Option[InningsBatsman] = {
    batsmen.filter( _.notOut ) match {
      case first :: second :: _ => Some(second)
      case _ => None
    }
  }
  lazy val lastOut: Option[InningsBatsman] = batsmen.filter( _.out ).lastOption
  lazy val currentBowler: Option[InningsBowler] = bowlers.find( _.onStrike )
}

case class InningsBatsman(
  name: String,
  ballsFaced: Int,
  runs: Int,
  fours: Int,
  sixes: Int,
  out: Boolean,
  howOut: String,
  onStrike: Boolean,
  nonStrike: Boolean) {
  lazy val notOut: Boolean = !out
}

case class InningsBowler(
  name: String,
  overs: Int,
  maidens: Int,
  runs: Int,
  wickets: Int,
  onStrike: Boolean,
  nonStrike: Boolean)

case class InningsWicket(
  order: Int,
  name: String,
  runs: Int)