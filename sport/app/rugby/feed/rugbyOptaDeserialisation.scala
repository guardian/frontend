package rugby.feed

import org.joda.time.format.DateTimeFormat
import rugby.model._
import Status._

import scala.xml.{NodeSeq, XML, MetaData, UnprefixedAttribute, Null}

object Parser {

  private object Date {
    private val dateTimeParser = DateTimeFormat.forPattern("yyyyMMdd HH:mm:ss")

    def apply(date: String, time: String) = dateTimeParser.parseDateTime(s"$date $time")
  }

  def parseLiveScores(body: String, event: OptaEvent): Seq[Match] = {

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
          status = parseStatus(game),
          event = event
        )
      }
    }
  }

  def parseFixturesAndResults(body: String, event: OptaEvent): Seq[Match] = {
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
          status = parseStatus(fixture),
          event = event
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

    val teams = data \ "TeamDetail" \ "Team"

    val teamsStats: Seq[TeamStat] = teams.map { team =>
      
      val teamStatDataRaw =  team \ "TeamStats" \ "TeamStat"

      /* MetaData.append is extremly slow as it tries to normalize all attributes each time we append, so we chain attributes manually */ 
      val allAttributes = chainAttributes(teamStatDataRaw.map(_.attributes))
      val teamStatData = <TeamStat />.copy(attributes = allAttributes)
      
      TeamStat(
        name = (team \ "@team_name").text,
        id = (teamStatData \ "@id").text.toLong,
        possession = (teamStatData \ "@possession").text.toFloat,
        territory = (teamStatData \ "@territory").text.toFloat,
        carries_metres = (teamStatData \ "@carries_metres").text.toInt,
        tackles = (teamStatData \ "@tackles").text.toInt,
        missed_tackles = (teamStatData \ "@missed_tackles").text.toInt,
        tackle_success = (teamStatData \ "@tackle_success").text.toFloat,
        turnover_won = (teamStatData \ "@turnover_won").text.toInt,
        turnovers_conceded = (teamStatData \ "@turnovers_conceded").text.toInt,
        lineouts_won = (teamStatData \ "@lineouts_won").text.toInt,
        lineouts_lost = (teamStatData \ "@lineouts_Lost").text.toInt,
        mauls_won = (teamStatData \ "@mauls_won").text.toInt,
        mauls_lost = (teamStatData \ "@mauls_lost").text.toInt,
        mauls_total = (teamStatData \ "@mauls_total").text.toInt,

        penalties_conceded = (teamStatData \ "@penalties_conceded").text.toInt,
        penalty_conceded_dissent = (teamStatData \ "@penalty_conceded_dissent").text.toInt,
        penalty_conceded_delib_knock_on = (teamStatData \ "@penalty_conceded_delib_knock_on").text.toInt,
        penalty_conceded_early_tackle = (teamStatData \ "@penalty_conceded_early_tackle").text.toInt,
        penalty_conceded_handling_in_ruck = (teamStatData \ "@penalty_conceded_handling_in_ruck").text.toInt,
        penalty_conceded_high_tackle = (teamStatData \ "@penalty_conceded_high_tackle").text.toInt,
        penalty_conceded_lineout_offence = (teamStatData \ "@penalty_conceded_lineout_offence").text.toInt,
        penalty_conceded_collapsing = (teamStatData \ "@penalty_conceded_collapsing").text.toInt,
        penalty_conceded_collapsing_maul = (teamStatData \ "@penalty_conceded_collapsing_maul").text.toInt,
        penalty_conceded_collapsing_offence = (teamStatData \ "@penalty_conceded_collapsing_offence").text.toInt,
        penalty_conceded_obstruction = (teamStatData \ "@penalty_conceded_obstruction").text.toInt,
        penalty_conceded_offside = (teamStatData \ "@penalty_conceded_offside").text.toInt,
        penalty_conceded_opp_half = (teamStatData \ "@penalty_conceded_opp_half").text.toInt,
        penalty_conceded_own_half = (teamStatData \ "@penalty_conceded_own_half").text.toInt,
        penalty_conceded_other = (teamStatData \ "@penalty_conceded_other").text.toInt,
        penalty_conceded_scrum_offence = (teamStatData \ "@penalty_conceded_scrum_offence").text.toInt,
        penalty_conceded_stamping = (teamStatData \ "@penalty_conceded_stamping").text.toInt,
        penalty_conceded_wrong_side = (teamStatData \ "@penalty_conceded_wrong_side").text.toInt,

        rucks_won = (teamStatData \ "@rucks_won").text.toInt,
        rucks_lost = (teamStatData \ "@rucks_lost").text.toInt,
        rucks_total = (teamStatData \ "@rucks_total").text.toInt,

        scrums_won = (teamStatData \ "@scrums_won").text.toInt,
        scrums_lost = (teamStatData \ "@scrums_lost").text.toInt,
        scrums_total = (teamStatData \ "@scrums_total").text.toInt
      )
    }
    MatchStat(teamsStats)
  }

  private def chainAttributes(attributes: Iterable[MetaData]): MetaData = {
    attributes match {
      case Nil => Null
      case head :: tail => new UnprefixedAttribute(head.key, head.value, chainAttributes(tail))
    }
  }


}
