package cricketModel

import org.joda.time.DateTime

case class Match(
  teams: List[Team],
  innings: List[Innings],
  sessions: List[Session],
  competitionName: String,
  description: String,
  venueName: String,
  result: String,
  gameDate: DateTime)
{
  def homeTeam: Team = teams.filter(_.homeOrAway == "home").head
  def awayTeam: Team = teams.filter(_.homeOrAway == "away").head
  def homeTeamInnings: List[Innings] = innings.filter(x => x.battingTeamId == homeTeam.id).sortBy(_.id)
  def awayTeamInnings: List[Innings] = innings.filter(x => x.battingTeamId == awayTeam.id).sortBy(_.id)

  def lastInnings: Option[Innings] = {
    innings match {
      case Nil => None
      case _ => Some(innings.last)
    }
  }

  def firstInBatsman: Option[InningsBatsman] = {
    lastInnings match {
      case Some(innings) => innings.batsmen.indexWhere(x => !x.out) match {
        case -1 => None
        case index => Some(innings.batsmen(index))
      }
      case _ => None
    }
  }

  def secondInBatsman: Option[InningsBatsman] = {
    lastInnings match {
      case Some(innings) => innings.batsmen.lastIndexWhere(x => !x.out) match {
        case -1 => None
        case index => Some(innings.batsmen(index))
      }
      case _ => None
    }
  }

  def lastOut: Option[InningsBatsman] = {
    lastInnings match {
      case Some(innings) => innings.batsmen.lastIndexWhere(x => x.out) match {
        case -1 => None
        case index => Some(innings.batsmen(index))
      }
      case _ => None
    }
  }

  def bowlerOnStrike: Option[InningsBowler] = {
    lastInnings match {
      case Some(innings) => innings.bowlers.filter(x => x.onStrike) match {
        case head :: _ => Some(head)
        case Nil => None
      }
      case _ => None
    }
  }
}

case class Session(
  day: String)

case class Team(
  name: String,
  id: Int,
  homeOrAway: String)

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
  fallOfWicket: List[InningsWicket])
{
  def closed = declared || forfeited || allOut
  def allOut = wickets == 10
  def wickets = fallOfWicket.length
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
  nonStrike: Boolean)

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