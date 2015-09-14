package rugby.model

import org.joda.time.DateTime
import org.joda.time.format.{DateTimeFormat, DateTimeFormatter}
import Status._

case class Match(
  date: DateTime,
  id: String,
  homeTeam: Team,
  awayTeam: Team,
  venue: Option[String],
  competitionName: String,
  status: Status
) {
  def hasTeam(teamId: String) = homeTeam.id == teamId || awayTeam.id == teamId

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


case class MatchStat (
  teams: Seq[TeamStat]
)

case class TeamStat (
  id: Long,
  name: String,
  players: Seq[PlayerStat]
)

case class PlayerStat (
     
   /* non statistics info */ 
   id: Long,
   team_id: Long,
   game_id: Long,
   player_id: Long,

   /* time info */
   minutes: MinutesStat,

   /* Suspension infos */ 
   yellow_cards: Int,
   red_card_second_yellow: Int,
   red_cards: Int,

   /* Unknow info */ 
   dropped_catch: Int,
   clean_breaks: Int,
   
   /* General positive stats */
   goals: Int,
   points: Int,
   passes: Int,
   runs: Int,
   defenders_beaten: Int,
   gain_line: Int,
   metres: Int,
   offload: Int,
   pickup: Int,

   /* General error stats */
   bad_passes: Int,
   handling_error: Int,
   ball_out_of_play: Int,

   /* tackle info  */ 
   tackles: Int,
   tackle_success: Float,
   missed_tackles: Int,

   /* Carries info */ 
   carries: CarriesStat,

   /* Rucks info */
   rucks_won: Int,
   rucks_lost: Int,

   /* Mauls info */
   mauls: MaulsStat,


   /* Scrums info */ 
   scrums: ScrumsStat,

   /* kicks info */
   kick: KickStat,

   tries: Int,
   try_assist: Int,
   try_assists: Int,
   try_kicks: Int,

   conversion_goals: Int,
   missed_conversion_goals: Int,

   missed_goals: Int,
   drop_goals_converted: Int,
   drop_goal_missed: Int,


   /* Lineout info */
   lineout: LineoutStat,
   
   /* Collection info */ 
   collection: CollectionStat,

   /* Restart info */
   restart: RestartStat,

   /* Penalties info */
   penalties: PenaltiesStat,

   /* turnover info */
   turnover: TurnoverStat
)


case class MinutesStat (
  minutes_played_before_first_half: Int,
  minutes_played_before_first_half_extra: Int,
  minutes_played_first_half: Int,
  minutes_played_before_second_half: Int,
  minutes_played_before_second_half_extra: Int,
  minutes_played_before_penalty_shootOut: Int,
  minutes_played_second_half: Int,
  minutes_played_second_half_extra: Int,
  minutes_played_total: Int
)

case class CarriesStat (
  carries_crossed_gain_line: Int,
  carries_metres: Int,
  carries_not_made_gain_line: Int,
  carries_support: Int
)

case class MaulsStat (
  mauls_won: Int,
  mauls_won_outright: Int,
  mauls_won_penalty: Int,
  mauls_won_try: Int,
  mauls_won_penalty_try: Int,
  mauls_lost: Int,
  mauls_lost_outright: Int,
  mauls_lost_turnover: Int
)

case class ScrumsStat (
  scrums_won_penalty_try: Int,
  scrums_won_free_kick: Int,
  scrums_won_pushover_try: Int,
  scrums_won_outright: Int,
  scrums_lost_reversed: Int,
  scrums_lost_outright: Int,
  scrums_lost_penalty: Int,
  scrums_lost_free_kick: Int
)

case class KickStat (
  kicks: Int,
  kick_charged_down: Int,
  kick_from_hand_metres: Int,
  kick_metres: Int,
  kick_in_field: Int,
  kick_in_touch: Int,
  kick_oppn_collection: Int,
  kick_out_of_play: Int,
  kick_penalty_bad: Int,
  kick_possession_lost: Int,
  kick_possession_retained: Int,
  kick_percent_success: Float,
  kick_penalty_good: Int,
  kick_touch_in_goal: Int,
  kick_try_scored: Int,
  kicks_from_hand: Int,
  free_kick_conceded_at_lineout: Int,
  free_kick_conceded_at_scrum: Int,
  free_kick_conceded_in_general_play: Int,
  free_kick_conceded_in_ruck_or_maul: Int,
  pc_kick_percent: Float,
  total_free_kicks_conceded: Int,
  kicking_competition_goals: Int,
  retained_kicks: Int,
  true_retained_kicks: Int
)

case class LineoutStat (
  lineout_success: Float,
  lineout_non_straight: Int,
  lineout_throw_lost_handling_error: Int,
  lineout_throw_lost_free_kick: Int,
  lineout_throw_lost_outright: Int,
  lineout_throw_lost_not_straight: Int,
  lineout_throw_lost_penalty: Int,
  lineout_throw_won_penalty: Int,
  lineout_throw_won_tap: Int,
  lineout_throw_won_clean: Int,
  lineout_throw_won_free_kick: Int,
  lineout_won_opp_throw: Int,
  lineout_won_own_throw: Int,
  lineout_won_steal: Int,
  lineouts_to_own_player: Int,
  lineouts_lost: Int,
  lineouts_won: Int,
  lineouts_infringe_opp: Int,
  total_lineouts: Int
)

case class CollectionStat (
  collection_loose_ball: Int,
  collection_failed: Int,
  collection_from_kick: Int,
  collection_interception: Int,
  collection_success: Float
)

case class RestartStat (
  restart_22m: Int,
  restart_error_not_ten: Int,
  restart_error_out_of_play: Int,
  restart_halfway: Int,
  restarts_lost: Int,
  restart_opp_error: Int,
  restart_own_player: Int,
  restarts_success: Float,
  restarts_won: Int
)

case class PenaltiesStat (
   penalties_conceded: Int,
   penalty_conceded_collapsing_offence: Int,
   penalty_conceded_collapsing_maul: Int,
   penalty_conceded_early_tackle: Int,
   penalty_conceded_delib_knock_on: Int,
   penalty_conceded_dissent: Int,
   penalty_conceded_foul_play: Int,
   penalty_conceded_high_tackle: Int,
   penalty_conceded_killing_ruck: Int,
   penalty_conceded_offside: Int,
   penalty_conceded_other: Int,
   penalty_conceded_own_half: Int,
   penalty_conceded_opp_half: Int,
   penalty_conceded_lineout_offence: Int,
   penalty_conceded_line_out_offence: Int,
   penalty_conceded_handling_in_ruck: Int,
   penalty_conceded_obstruction: Int,
   penalty_conceded_scrum_offence: Int,
   penalty_conceded_stamping: Int,
   penalty_conceded_wrong_side: Int,
   pen_defs: String, /* ??? */
   pen_offs: String, /* ??? */
   penalty_goals: Int,
   missed_penalty_goals: Int,
   penalty_kick_for_touch_metres: Int
)

case class TurnoverStat (
  turnover_bad_pass: Int,
  turnover_carried_in_touch: Int,
  turnover_carried_over: Int,
  turnovers_conceded: Int,
  turnover_forward_pass: Int,
  turnover_kick_error: Int,
  turnover_knock_on: Int,
  turnover_lost_in_ruck_or_maul: Int,
  turnover_opp_half: Int,
  turnover_own_half: Int,
  turnover_turnover_forward_pass: Int,
  turnover_won: Int
)