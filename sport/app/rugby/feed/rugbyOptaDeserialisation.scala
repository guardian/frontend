package rugby.feed

import org.joda.time.format.DateTimeFormat
import rugby.model._
import rugby.model.{Team, Match, Status}
import Status._

import scala.xml.{NodeSeq, XML, MetaData, UnprefixedAttribute, Null}

object Parser {

  private object Date {
    private val dateTimeParser = DateTimeFormat.forPattern("yyyyMMdd HH:mm:ss")

    def apply(date: String, time: String) = dateTimeParser.parseDateTime(s"$date $time")
  }

  def parseLiveScores(body: String): Seq[Match] = {

    val data = XML.loadString(body)

    val gamesData = data \ "game"

    val teamsData = data \ "teams" \ "team"
    val teams = parseTeams(teamsData)

    gamesData.flatMap { game =>

      val teamsNodes = game \ "team"

      for {
        homeTeam <- getTeamWithLiveScore(teamsNodes, teams, "home")
        awayTeam <- getTeamWithLiveScore(teamsNodes, teams, "away")
      } yield {

        Match(
          date = Date((game \ "@game_date").text, (game \ "@time").text),
          id = (game \ "@id").text,
          homeTeam = homeTeam,
          awayTeam = awayTeam,
          venue = None,
          competitionName = (game \ "@comp_name").text,
          status = parseStatus(game)
        )
      }
    }
  }

  def parseFixturesAndResults(body: String): Seq[Match] = {
    val data = XML.loadString(body)

    val fixturesData = data \ "fixture"

    val teamsData = data \ "teams" \ "team"
    val teams = parseTeams(teamsData)

    fixturesData.flatMap { fixture =>
      val teamNodes = fixture \ "team"

      for {
        homeTeam <- getTeamWithResult(teamNodes, teams, "home")
        awayTeam <- getTeamWithResult(teamNodes, teams, "away")
      } yield {
        Match(
          date = Date((fixture \ "@game_date").text, (fixture \ "@time").text),
          id = (fixture \ "@id").text,
          homeTeam = homeTeam,
          awayTeam = awayTeam,
          venue = Some((fixture \ "@venue").text),
          competitionName = (fixture \ "@comp_name").text,
          status = parseStatus(fixture)
        )
      }
    }
  }

  def parseLiveEventsStatsToGetScoreEvents(body: String): Seq[ScoreEvent] = {
    val data = XML.loadString(body)

    val eventsData = data \ "Events" \ "Event"

    val scoreEventsData = eventsData.filter { eventData =>
      val eventType = (eventData \ "@type").text
      ScoreType.values.exists(_.toString == eventType)
    }

    val players = getPlayers(data \ "TeamDetail" \ "Team")

    scoreEventsData.flatMap { scoreEventData =>
      val player = players.find(_.id == (scoreEventData \ "@player_id").text)
      player.map { p =>
        ScoreEvent(
          player = p,
          minute = (scoreEventData \ "@minute").text,
          `type` = ScoreType.withName((scoreEventData \ "@type").text)
        )
      }
    }
  }

  private def getPlayers(teamsNodes: NodeSeq): Seq[Player] = {
    teamsNodes.flatMap { teamData =>
      val team = Team((teamData \ "@team_id").text, (teamData \ "@team_name").text)
      val playersData = teamData \ "Player"
      playersData.map { playerData =>
        Player((playerData \ "@id").text, (playerData \ "@player_name").text, team)
      }
    }
  }

  private def getTeamWithLiveScore(teamNodes: NodeSeq, teams: Seq[Team], status: String): Option[Team] = {
    val teamNodeOpt = teamNodes.find(team => (team \ "@home_or_away").text == status)

    for {
      teamNode <- teamNodeOpt
      teamOpt = teams.find(team => team.id == (teamNode \ "@team_id").text)
      team <- teamOpt
    } yield {
      val teamScoreAsString = (teamNode \ s"@${status}_score").text
      val teamScore = if(teamScoreAsString == "") None else Some(teamScoreAsString.toInt)
      team.copy(score = teamScore)
    }
  }

  private def getTeamWithResult(teamNodes: NodeSeq, teams: Seq[Team], status: String): Option[Team] = {
    val teamNodeOpt = teamNodes.find(team => (team \ "@home_or_away").text == status)

    for {
      teamNode <- teamNodeOpt
      teamOpt = teams.find(team => team.id == (teamNode \ "@team_id").text)
      team <- teamOpt
    } yield {
      val teamScoreNode = (teamNode \ "@score")
      val teamScore = if (teamScoreNode.nonEmpty) Some(teamScoreNode.text.toInt) else None
      team.copy(score = teamScore)
    }
  }

  private def parseTeams(teamsData: NodeSeq): Seq[Team] = {
    teamsData.map { team =>
      Team((team \ "@id").text,
        (team \ "@name").text)
    }
  }

  private def parseStatus(game: NodeSeq): Status = {
    (game \ "@status").text match {
      case "Result" => Result
      case "Postponed" => Postponed
      case "Abandoned" => Abandoned
      case "Fixture" => Fixture
      case "Team in" => TeamIn
      case "First half" => FirstHalf
      case "Halftime" => HalfTime
      case "Second half" => SecondHalf
      case "Fulltime" => FullTime
      case "Extra time first half" => ExtraTimeFirstHalf
      case "Extra time half time" => ExtraTimeHalfTime
      case "Extra time second half" => ExtraTimeSecondHalf
      case "Sudden death" => SuddenDeath
      case "Shoot out" => ShootOut
      case _ => Fixture
    }
  }



  def parseLiveEventsStatsToGetMatchStat(body: String): MatchStat = {
    val data = XML.loadString(body)

    val teamsData = data \ "TeamDetail" \ "Team"

    val teams: Seq[TeamStat] = teamsData.map { teamData =>
      
      val playersData = teamData \ "Player"

      val players = playersData.map { player => 

        val playerStatData = player \  "PlayerStats" \ "PlayerStat"

        /* MetaData.append is extremly slow as it tries to normalize all attributes each time we append, so we chain attributes manually */ 
        val allAttributes = chainAttributes(playerStatData.map(_.attributes))
        val playerData = <PlayerStat />.copy(attributes = allAttributes)

        PlayerStat(
          id = (playerData \ "@id").text.toLong,
          team_id = (playerData \ "@team_id").text.toLong,
          game_id = (playerData \ "@game_id").text.toLong,
          player_id = (playerData \ "@player_id").text.toLong,
          
          minutes = MinutesStat(
            minutes_played_before_first_half =  (playerData \ "@minutes_played_before_first_half").text.toInt,
            minutes_played_before_first_half_extra = (playerData \ "@minutes_played_before_first_half_extra").text.toInt,
            minutes_played_first_half = (playerData \ "@minutes_played_first_half").text.toInt,
            minutes_played_before_second_half = (playerData \ "@minutes_played_before_second_half").text.toInt,
            minutes_played_before_second_half_extra = (playerData \ "@minutes_played_before_second_half_extra").text.toInt,
            minutes_played_before_penalty_shootOut = (playerData \ "@minutes_played_before_penalty_shootOut").text.toInt,
            minutes_played_second_half = (playerData \ "@minutes_played_second_half").text.toInt,
            minutes_played_second_half_extra = (playerData \ "@minutes_played_second_half_extra").text.toInt,
            minutes_played_total = (playerData \ "@minutes_played_total").text.toInt
          ),

          yellow_cards = (playerData \ "@yellow_cards").text.toInt,
          red_card_second_yellow = (playerData \ "@red_card_second_yellow").text.toInt,
          red_cards = (playerData \ "@red_cards").text.toInt,
          dropped_catch = (playerData \ "@dropped_catch").text.toInt,
          clean_breaks = (playerData \ "@clean_breaks").text.toInt,
          goals = (playerData \ "@goals").text.toInt,
          points = (playerData \ "@points").text.toInt,
          passes = (playerData \ "@passes").text.toInt,
          runs = (playerData \ "@runs").text.toInt,
          defenders_beaten = (playerData \ "@defenders_beaten").text.toInt,
          gain_line = (playerData \ "@gain_line").text.toInt,
          metres = (playerData \ "@metres").text.toInt,
          offload = (playerData \ "@offload").text.toInt,
          pickup = (playerData \ "@pickup").text.toInt,
          bad_passes = (playerData \ "@bad_passes").text.toInt,
          handling_error = (playerData \ "@handling_error").text.toInt,
          ball_out_of_play = (playerData \ "@ball_out_of_play").text.toInt,
          tackles = (playerData \ "@tackles").text.toInt,
          tackle_success = (playerData \ "@tackle_success").text.toFloat,
          missed_tackles = (playerData \ "@missed_tackles").text.toInt,
          
          carries = CarriesStat(
            carries_crossed_gain_line = (playerData \ "@carries_crossed_gain_line").text.toInt,
            carries_metres = (playerData \ "@carries_metres").text.toInt,
            carries_not_made_gain_line = (playerData \ "@carries_not_made_gain_line").text.toInt,
            carries_support = (playerData \ "@carries_support").text.toInt
          ),

          rucks_won = (playerData \ "@rucks_won").text.toInt,
          rucks_lost = (playerData \ "@rucks_lost").text.toInt,
          
          mauls = MaulsStat(
            mauls_won = (playerData \ "@mauls_won").text.toInt,
            mauls_won_outright = (playerData \ "@mauls_won_outright").text.toInt,
            mauls_won_penalty = (playerData \ "@mauls_won_penalty").text.toInt,
            mauls_won_try = (playerData \ "@mauls_won_try").text.toInt,
            mauls_won_penalty_try = (playerData \ "@mauls_won_penalty_try").text.toInt,
            mauls_lost = (playerData \ "@mauls_lost").text.toInt,
            mauls_lost_outright = (playerData \ "@mauls_lost_outright").text.toInt,
            mauls_lost_turnover = (playerData \ "@mauls_lost_turnover").text.toInt
          ),

          scrums = ScrumsStat(
            scrums_won_penalty_try = (playerData \ "@scrums_won_penalty_try").text.toInt,
            scrums_won_free_kick = (playerData \ "@scrums_won_free_kick").text.toInt,
            scrums_won_pushover_try = (playerData \ "@scrums_won_pushover_try").text.toInt,
            scrums_won_outright = (playerData \ "@scrums_won_outright").text.toInt,
            scrums_lost_reversed = (playerData \ "@scrums_lost_reversed").text.toInt,
            scrums_lost_outright = (playerData \ "@scrums_lost_outright").text.toInt,
            scrums_lost_penalty = (playerData \ "@scrums_lost_penalty").text.toInt,
            scrums_lost_free_kick = (playerData \ "@scrums_lost_free_kick").text.toInt
          ),
         
          kick = KickStat(
            kicks = (playerData \ "@kicks").text.toInt,
            kick_charged_down = (playerData \ "@kick_charged_down").text.toInt,
            kick_from_hand_metres = (playerData \ "@kick_from_hand_metres").text.toInt,
            kick_metres = (playerData \ "@kick_metres").text.toInt,
            kick_in_field = (playerData \ "@kick_in_field").text.toInt,
            kick_in_touch = (playerData \ "@kick_in_touch").text.toInt,
            kick_oppn_collection = (playerData \ "@kick_oppn_collection").text.toInt,
            kick_out_of_play = (playerData \ "@kick_out_of_play").text.toInt,
            kick_penalty_bad = (playerData \ "@kick_penalty_bad").text.toInt,
            kick_possession_lost = (playerData \ "@kick_possession_lost").text.toInt,
            kick_possession_retained = (playerData \ "@kick_possession_retained").text.toInt,
            kick_percent_success = (playerData \ "@kick_percent_success").text.toFloat,
            kick_penalty_good = (playerData \ "@kick_penalty_good").text.toInt,
            kick_touch_in_goal = (playerData \ "@kick_touch_in_goal").text.toInt,
            kick_try_scored = (playerData \ "@kick_try_scored").text.toInt,
            kicks_from_hand = (playerData \ "@kicks_from_hand").text.toInt,
            free_kick_conceded_at_lineout = (playerData \ "@free_kick_conceded_at_lineout").text.toInt,
            free_kick_conceded_at_scrum = (playerData \ "@free_kick_conceded_at_scrum").text.toInt,
            free_kick_conceded_in_general_play = (playerData \ "@free_kick_conceded_in_general_play").text.toInt,
            free_kick_conceded_in_ruck_or_maul = (playerData \ "@free_kick_conceded_in_ruck_or_maul").text.toInt,
            pc_kick_percent = (playerData \ "@pc_kick_percent").text.toFloat,
            total_free_kicks_conceded = (playerData \ "@total_free_kicks_conceded").text.toInt,
            kicking_competition_goals = (playerData \ "@kicking_competition_goals").text.toInt,
            retained_kicks = (playerData \ "@retained_kicks").text.toInt,
            true_retained_kicks = (playerData \ "@true_retained_kicks").text.toInt
          ),
          
          tries = (playerData \ "@tries").text.toInt,
          try_assist = (playerData \ "@try_assist").text.toInt,
          try_assists = (playerData \ "@try_assists").text.toInt,
          try_kicks = (playerData \ "@try_kicks").text.toInt,

          conversion_goals = (playerData \ "@conversion_goals").text.toInt,
          missed_conversion_goals = (playerData \ "@missed_conversion_goals").text.toInt,
          missed_goals = (playerData \ "@missed_goals").text.toInt,
          drop_goals_converted = (playerData \ "@drop_goals_converted").text.toInt,
          drop_goal_missed = (playerData \ "@drop_goal_missed").text.toInt,
          
          lineout = LineoutStat(
            lineout_success = (playerData \ "@lineout_success").text.toFloat,
            lineouts_lost = (playerData \ "@lineouts_lost").text.toInt,
            lineouts_won = (playerData \ "@lineouts_won").text.toInt,
            lineouts_infringe_opp = (playerData \ "@lineouts_infringe_opp").text.toInt,
            lineout_non_straight = (playerData \ "@lineout_non_straight").text.toInt,
            lineouts_to_own_player = (playerData \ "@lineouts_to_own_player").text.toInt,
            lineout_throw_lost_handling_error = (playerData \ "@lineout_throw_lost_handling_error").text.toInt,
            lineout_throw_lost_free_kick = (playerData \ "@lineout_throw_lost_free_kick").text.toInt,
            lineout_throw_lost_outright = (playerData \ "@lineout_throw_lost_outright").text.toInt,
            lineout_throw_lost_not_straight = (playerData \ "@lineout_throw_lost_not_straight").text.toInt,
            lineout_throw_lost_penalty = (playerData \ "@lineout_throw_lost_penalty").text.toInt,
            lineout_throw_won_penalty = (playerData \ "@lineout_throw_won_penalty").text.toInt,
            lineout_throw_won_tap = (playerData \ "@lineout_throw_won_tap").text.toInt,
            lineout_throw_won_clean = (playerData \ "@lineout_throw_won_clean").text.toInt,
            lineout_throw_won_free_kick = (playerData \ "@lineout_throw_won_free_kick").text.toInt,
            lineout_won_opp_throw = (playerData \ "@lineout_won_opp_throw").text.toInt,
            lineout_won_own_throw = (playerData \ "@lineout_won_own_throw").text.toInt,
            lineout_won_steal = (playerData \ "@lineout_won_steal").text.toInt,
            total_lineouts = (playerData \ "@total_lineouts").text.toInt
          ),

          collection = CollectionStat(
            collection_loose_ball = (playerData \ "@collection_loose_ball").text.toInt,
            collection_failed = (playerData \ "@collection_failed").text.toInt,
            collection_from_kick = (playerData \ "@collection_from_kick").text.toInt,
            collection_interception = (playerData \ "@collection_interception").text.toInt,
            collection_success = (playerData \ "@collection_success").text.toFloat
          ),

          restart = RestartStat(
            restart_22m = (playerData \ "@restart_22m").text.toInt,
            restart_error_not_ten = (playerData \ "@restart_error_not_ten").text.toInt,
            restart_error_out_of_play = (playerData \ "@restart_error_out_of_play").text.toInt,
            restart_halfway = (playerData \ "@restart_halfway").text.toInt,
            restarts_lost = (playerData \ "@restarts_lost").text.toInt,
            restart_opp_error = (playerData \ "@restart_opp_error").text.toInt,
            restart_own_player = (playerData \ "@restart_own_player").text.toInt,
            restarts_success = (playerData \ "@restarts_success").text.toFloat,
            restarts_won = (playerData \ "@restarts_won").text.toInt            
          ),

          penalties = PenaltiesStat(
            penalties_conceded = (playerData \ "@penalties_conceded").text.toInt,
            penalty_conceded_collapsing_offence = (playerData \ "@penalty_conceded_collapsing_offence").text.toInt,
            penalty_conceded_collapsing_maul = (playerData \ "@penalty_conceded_collapsing_maul").text.toInt,
            penalty_conceded_early_tackle = (playerData \ "@penalty_conceded_early_tackle").text.toInt,
            penalty_conceded_delib_knock_on = (playerData \ "@penalty_conceded_delib_knock_on").text.toInt,
            penalty_conceded_dissent = (playerData \ "@penalty_conceded_dissent").text.toInt,
            penalty_conceded_foul_play = (playerData \ "@penalty_conceded_foul_play").text.toInt,
            penalty_conceded_high_tackle = (playerData \ "@penalty_conceded_high_tackle").text.toInt,
            penalty_conceded_killing_ruck = (playerData \ "@penalty_conceded_killing_ruck").text.toInt,
            penalty_conceded_offside = (playerData \ "@penalty_conceded_offside").text.toInt,
            penalty_conceded_other = (playerData \ "@penalty_conceded_other").text.toInt,
            penalty_conceded_own_half = (playerData \ "@penalty_conceded_own_half").text.toInt,
            penalty_conceded_opp_half = (playerData \ "@penalty_conceded_opp_half").text.toInt,
            penalty_conceded_lineout_offence = (playerData \ "@penalty_conceded_lineout_offence").text.toInt,
            penalty_conceded_line_out_offence = (playerData \ "@penalty_conceded_line_out_offence").text.toInt,
            penalty_conceded_handling_in_ruck  = (playerData \ "@penalty_conceded_handling_in_ruck").text.toInt,
            penalty_conceded_obstruction = (playerData \ "@penalty_conceded_obstruction").text.toInt,
            penalty_conceded_scrum_offence = (playerData \ "@penalty_conceded_scrum_offence").text.toInt,
            penalty_conceded_stamping = (playerData \ "@penalty_conceded_stamping").text.toInt,
            penalty_conceded_wrong_side = (playerData \ "@penalty_conceded_wrong_side").text.toInt,
            pen_defs = (playerData \ "@pen_defs").text,
            pen_offs = (playerData \ "@pen_offs").text,
            penalty_goals = (playerData \ "@penalty_goals").text.toInt,
            missed_penalty_goals = (playerData \ "@missed_penalty_goals").text.toInt,
            penalty_kick_for_touch_metres = (playerData \ "@penalty_kick_for_touch_metres").text.toInt
          ),
          
          turnover = TurnoverStat (
            turnover_bad_pass = (playerData \ "@turnover_bad_pass").text.toInt,
            turnover_carried_in_touch = (playerData \ "@turnover_carried_in_touch").text.toInt,
            turnover_carried_over = (playerData \ "@turnover_carried_over").text.toInt,
            turnover_forward_pass = (playerData \ "@turnover_forward_pass").text.toInt,
            turnover_kick_error = (playerData \ "@turnover_kick_error").text.toInt,
            turnover_knock_on = (playerData \ "@turnover_knock_on").text.toInt,
            turnover_lost_in_ruck_or_maul = (playerData \ "@turnover_lost_in_ruck_or_maul").text.toInt,
            turnover_own_half = (playerData \ "@turnover_own_half").text.toInt,
            turnover_opp_half = (playerData \ "@turnover_opp_half").text.toInt,
            turnover_won = (playerData \ "@turnover_won").text.toInt,
            turnovers_conceded = (playerData \ "@turnovers_conceded").text.toInt,
            turnover_turnover_forward_pass = (playerData \ "@turnover_turnover_forward_pass").text.toInt
          )
        )
      }
      TeamStat((teamData \ "@team_id").text.toLong, (teamData \ "@team_name").text, players)
    }
    MatchStat(teams)
  }

  private def chainAttributes(attributes: Iterable[MetaData]): MetaData = {
    attributes match {
      case Nil => Null
      case head :: tail => new UnprefixedAttribute(head.key, head.value, chainAttributes(tail))
    }
  }

}
