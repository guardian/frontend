package rugby.model

import org.joda.time.DateTime
import org.joda.time.format.{DateTimeFormat, DateTimeFormatter}
import play.api.libs.json._
import rugby.feed.RugbyEvent
import rugby.model.Status._

case class Match(
    date: DateTime,
    id: String,
    homeTeam: Team,
    awayTeam: Team,
    venue: Option[String],
    competitionName: String,
    status: Status,
    event: RugbyEvent,
    stage: Stage.Value,
) {

  def hasTeam(teamId: String): Boolean = homeTeam.id == teamId || awayTeam.id == teamId

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
    List(
      FirstHalf,
      HalfTime,
      SecondHalf,
      ExtraTimeFirstHalf,
      ExtraTimeHalfTime,
      ExtraTimeSecondHalf,
      SuddenDeath,
      ShootOut,
    ).contains(status)
  }

  val isFixture: Boolean = status == Fixture
}

object Stage extends Enumeration(1) {
  type Stage = Value
  val Group, KnockOut = Value
}
object Match {
  val dateFormat: DateTimeFormatter = DateTimeFormat.forPattern("yyyy/MM/dd").withZoneUTC()
  implicit val writes: OWrites[Match] = (m: Match) =>
    Json.obj(
      "date" -> dateFormat.print(m.date),
      "id" -> m.id,
      "homeTeam" -> m.homeTeam,
      "awayTeam" -> m.awayTeam,
      "venue" -> m.venue,
      "competitionName" -> m.competitionName,
      "status" -> m.status,
      "event" -> m.event,
      "stage" -> m.stage,
    )
}

case class Team(
    id: String,
    name: String,
    score: Option[Int] = None,
)
object Team {
  implicit val writes: OWrites[Team] = Json.writes[Team]
}

case class Player(
    id: String,
    name: String,
    team: Team,
)
object Player {
  implicit val writes: OWrites[Player] = Json.writes[Player]
}

case class ScoreEvent(
    player: Player,
    minute: String,
    `type`: ScoreType.Value,
)
object ScoreEvent {
  implicit val writes: OWrites[ScoreEvent] = Json.writes[ScoreEvent]
}
object ScoreType extends Enumeration {
  val `Try` = Value("Try")
  val Conversion = Value("Conversion")
  val Penalty = Value("Penalty")
  val DropGoal = Value("Drop goal")
  val PenaltyTry = Value("Penalty Try")
}

trait Status

object Status {
  case object Result extends Status // The match is finished
  case object Postponed extends Status // The match has been postponed before kick off
  case object Abandoned extends Status // The match started but has been abandoned before it was completed
  case object Fixture extends Status // The match has not started
  case object TeamIn extends Status // The teams for the match have been announced and are in the feed
  case object FirstHalf extends Status // The match is in progress in the first half
  case object HalfTime extends Status // The match is at half time
  case object SecondHalf extends Status // The second half is being played
  case object FullTime
      extends Status // The game has finished the 80 minutes. Please not that this does not mean the match has finished as there may be extra time.
  case object ExtraTimeFirstHalf extends Status // The first half of extra time is being played
  case object ExtraTimeHalfTime extends Status // The first half of extra time has been played and it is at half time
  case object ExtraTimeSecondHalf extends Status // The second half of extra time is being played
  case object SuddenDeath
      extends Status // Occurs after extra time and essentially means the first point scorer in this period wins
  case object ShootOut extends Status // This is after sudden death and involves players taking drop kicks

  implicit val statusWrites: OWrites[Status] = OWrites(status => Json.obj("status" -> status.toString))
}

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
    lineouts_won: Int,
    lineouts_lost: Int,
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
    scrums_won: Int,
    scrums_lost: Int,
    scrums_total: Int,
)
object TeamStat {
  implicit val writes: OWrites[TeamStat] = (ts: TeamStat) =>
    Json.obj(
      "name" -> ts.name,
      "id" -> ts.id,
      "possession" -> ts.possession,
      "territory" -> ts.territory,
      "carries_metres" -> ts.carries_metres,
      "tackles" -> ts.tackles,
      "missed_tackles" -> ts.missed_tackles,
      "tackle_success" -> ts.tackle_success,
      "turnover_won" -> ts.turnover_won,
      "turnovers_conceded" -> ts.turnovers_conceded,
      "lineouts_won" -> ts.lineouts_won,
      "lineouts_lost" -> ts.lineouts_lost,
      "mauls_won" -> ts.mauls_won,
      "mauls_lost" -> ts.mauls_lost,
      "mauls_total" -> ts.mauls_total,
      "penalties_conceded" -> ts.penalties_conceded,
      "penalty_conceded_dissent" -> ts.penalty_conceded_dissent,
      "penalty_conceded_delib_knock_on" -> ts.penalty_conceded_delib_knock_on,
      "penalty_conceded_early_tackle" -> ts.penalty_conceded_early_tackle,
      "penalty_conceded_handling_in_ruck" -> ts.penalty_conceded_handling_in_ruck,
      "penalty_conceded_high_tackle" -> ts.penalty_conceded_high_tackle,
      "penalty_conceded_lineout_offence" -> ts.penalty_conceded_lineout_offence,
      "penalty_conceded_collapsing" -> ts.penalty_conceded_collapsing,
      "penalty_conceded_collapsing_maul" -> ts.penalty_conceded_collapsing_maul,
      "penalty_conceded_collapsing_offence" -> ts.penalty_conceded_collapsing_offence,
      "penalty_conceded_obstruction" -> ts.penalty_conceded_obstruction,
      "penalty_conceded_offside" -> ts.penalty_conceded_offside,
      "penalty_conceded_opp_half" -> ts.penalty_conceded_opp_half,
      "penalty_conceded_own_half" -> ts.penalty_conceded_own_half,
      "penalty_conceded_other" -> ts.penalty_conceded_other,
      "penalty_conceded_scrum_offence" -> ts.penalty_conceded_scrum_offence,
      "penalty_conceded_stamping" -> ts.penalty_conceded_stamping,
      "penalty_conceded_wrong_side" -> ts.penalty_conceded_wrong_side,
      "rucks_won" -> ts.rucks_won,
      "rucks_lost" -> ts.rucks_lost,
      "rucks_total" -> ts.rucks_total,
      "scrums_won" -> ts.scrums_won,
      "scrums_lost" -> ts.scrums_lost,
      "scrums_total" -> ts.scrums_total,
    )
}
case class MatchStat(
    teams: Seq[TeamStat],
)
object MatchStat {
  implicit val teamStatSeqWrites: Writes[Seq[TeamStat]] = Writes.seq(TeamStat.writes)
  implicit val writes: OWrites[MatchStat] = Json.writes[MatchStat]
}

case class GroupTable(
    name: String,
    teams: Seq[TeamRank],
)
object GroupTable {
  implicit val writes: OWrites[GroupTable] = Json.writes[GroupTable]
}

case class TeamRank(
    id: String,
    name: String,
    rank: Int,
    played: Int,
    won: Int,
    drawn: Int,
    lost: Int,
    pointsdiff: Int,
    points: Int,
)
object TeamRank {
  implicit val writes: OWrites[TeamRank] = Json.writes[TeamRank]
}
