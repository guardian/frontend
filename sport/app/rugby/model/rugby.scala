package rugby.model

import org.joda.time.DateTime
import org.joda.time.format.{DateTimeFormat, DateTimeFormatter}
import Status._
import rugby.feed.OptaEvent

case class Match(
  date: DateTime,
  id: String,
  homeTeam: Team,
  awayTeam: Team,
  venue: Option[String],
  competitionName: String,
  status: Status,
  event: OptaEvent,
  stage: Stage.Value
) {
  def hasTeam(teamId: String) = homeTeam.id == teamId || awayTeam.id == teamId

  lazy val hasGroupTable = event.hasGroupTable(stage)

  lazy val teamTags: List[String] = model.RugbyContent.teamNameIds.collect {
    case (tag, team) if List(homeTeam.id, awayTeam.id).contains(team) => tag
  }.toList

  lazy val key: String = {
    s"${Match.dateFormat.print(date)}/${homeTeam.id}/${awayTeam.id}"
  }

  override def toString(): String = {
    s"${homeTeam.name} v ${awayTeam.name} ${date.toString}"
  }

  val isLive: Boolean = {
    List( FirstHalf,
          HalfTime,
          SecondHalf,
          ExtraTimeFirstHalf,
          ExtraTimeHalfTime,
          ExtraTimeSecondHalf,
          SuddenDeath,
          ShootOut).contains(status)
  }

  val isFixture: Boolean = status == Fixture
}

object Stage extends Enumeration(1) {
  type Stage = Value
  val Group, KnockOut = Value
}

object Match {
  val dateFormat: DateTimeFormatter = DateTimeFormat.forPattern("yyyy/MM/dd")
}

case class Team(
  id: String,
  name: String,
  score: Option[Int] = None
)

case class Player(
  id: String,
  name: String,
  team: Team
)

case class ScoreEvent(
  player: Player,
  minute: String,
  `type`: ScoreType.Value
)

object ScoreType extends Enumeration {
  val `Try` = Value("Try")
  val Conversion = Value("Conversion")
  val Penalty = Value("Penalty")
  val DropGoal = Value("Drop goal")
  val PenaltyTry = Value("Penalty Try")
}

trait Status

object Status {
  object Result extends Status                // The match is finished
  object Postponed extends Status             // The match has been postponed before kick off
  object Abandoned extends Status             // The match started but has been abandoned before it was completed
  object Fixture extends Status               // The match has not started
  object TeamIn extends Status                // The teams for the match have been announced and are in the feed
  object FirstHalf extends Status             // The match is in progress in the first half
  object HalfTime extends Status              // The match is at half time
  object SecondHalf extends Status            // The second half is being played
  object FullTime extends Status              // The game has finished the 80 minutes. Please not that this does not mean the match has finished as there may be extra time.
  object ExtraTimeFirstHalf extends Status    // The first half of extra time is being played
  object ExtraTimeHalfTime extends Status     // The first half of extra time has been played and it is at half time
  object ExtraTimeSecondHalf extends Status   // The second half of extra time is being played
  object SuddenDeath extends Status           // Occurs after extra time and essentially means the first point scorer in this period wins
  object ShootOut extends Status              // This is after sudden death and involves players taking drop kicks
}

case class MatchStat(
  teams:Seq[TeamStat]
)

case class TeamStat(
  name: String,
  id: Long,
  possession: Float,
  territory: Float,
  carries_metres: Int,
  tackles: Int,
  missed_tackles: Int,
  tackle_success: Float,
  turnover_won: Int,
  turnovers_conceded: Int,

  lineouts_won:Int,
  lineouts_lost:Int,

  mauls_won: Int,
  mauls_lost: Int,
  mauls_total: Int,

  penalties_conceded: Int,
  penalty_conceded_dissent: Int,
  penalty_conceded_delib_knock_on: Int,
  penalty_conceded_early_tackle: Int,
  penalty_conceded_handling_in_ruck: Int,
  penalty_conceded_high_tackle: Int,
  penalty_conceded_lineout_offence: Int,
  penalty_conceded_collapsing: Int,
  penalty_conceded_collapsing_maul: Int,
  penalty_conceded_collapsing_offence: Int,
  penalty_conceded_obstruction: Int,
  penalty_conceded_offside: Int,
  penalty_conceded_opp_half: Int,
  penalty_conceded_own_half: Int,
  penalty_conceded_other: Int,
  penalty_conceded_scrum_offence: Int,
  penalty_conceded_stamping: Int,
  penalty_conceded_wrong_side: Int,

  rucks_won: Int,
  rucks_lost: Int,
  rucks_total: Int,

  scrums_won:Int,
  scrums_lost:Int,
  scrums_total: Int

)


case class GroupTable (
  name: String,
  teams: Seq[TeamRank]
)

case class TeamRank (
  id: String,
  name: String,
  rank: Int,
  played: Int,
  won: Int,
  drawn: Int,
  lost: Int,
  pointsdiff: Int,
  points: Int
)
