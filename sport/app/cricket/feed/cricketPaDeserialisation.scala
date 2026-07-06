package conf.cricketPa

import common.Chronos

import xml.{NodeSeq, XML}
import scala.language.postfixOps
import cricketModel._

import java.time.LocalDateTime
import java.util.TimeZone

object Parser {

  def parseMatch(scorecard: String, detail: String, lineups: String, competitionMatch: CompetitionMatch): Match = {
    val matchData = XML.loadString(detail) \ "match"
    val matchDetail = parseMatchDetail(matchData)
    val lineupData = XML.loadString(lineups)
    val scorecardData = XML.loadString(scorecard)

    Match(
      teams = parseTeams(lineupData \ "match" \ "team"),
      innings = parseInnings(scorecardData \ "match" \ "innings"),
      competitionName = competitionMatch.competitionName,
      stage = matchDetail.stage,
      venueName = matchDetail.venueName,
      result = matchDetail.status,
      currentDay = matchDetail.currentDay,
      totalDays = matchDetail.totalDays,
      gameDate = matchDetail.gameDate,
      officials = matchDetail.officials,
      matchId = competitionMatch.matchId,
      fullResult = matchDetail.result,
    )
  }

  def parseDate(dateTime: String): LocalDateTime = {
    Date(dateTime)
  }

  private case class MatchDetail(
      stage: String,
      venueName: String,
      status: String,
      currentDay: Int,
      totalDays: Int,
      gameDate: LocalDateTime,
      officials: List[String],
      result: Option[MatchResult],
  )

  private object Date {
    private val dateTimePattern = "yyyy-MM-dd'T'HH:mm:ss"
    private val dateTimeParser = Chronos.dateFormatter(dateTimePattern, TimeZone.getTimeZone("Europe/London").toZoneId)
    def apply(dateTime: String): LocalDateTime = LocalDateTime.parse(dateTime, dateTimeParser)
  }

  private def inningsDescription(inningsOrder: Int, battingTeam: String): String = {
    // Construct a string consisting of the team name and an innings index.
    if (inningsOrder == 1 || inningsOrder == 2) {
      s"$battingTeam first innings"
    } else {
      s"$battingTeam second innings"
    }
  }

  private def parseMatchDetail(matchDetail: NodeSeq): MatchDetail =
    MatchDetail(
      stage = matchDetail \ "stage" text,
      venueName = matchDetail \ "venue" \ "name" text,
      status = matchDetail \ "status" text,
      currentDay = (matchDetail \ "currentDay").text.toInt,
      totalDays = (matchDetail \ "totalDays").text.toInt,
      gameDate = Date(matchDetail \ "dateTime" text),
      officials = parseOfficials(matchDetail \ "official"),
      result = parseMatchResult(matchDetail \ "result"),
    )

  private def parseMatchWinner(winner: NodeSeq): Option[MatchWinner] =
    Option.when(winner.nonEmpty)(
      MatchWinner(
        winType = (winner \ "@type").text,
        margin = (winner \ "margin").headOption.map(_.text),
        team = (winner \ "team" \ "name").text,
      ),
    )

  private def parseMatchResult(result: NodeSeq): Option[MatchResult] =
    Option.when(result.nonEmpty)(
      MatchResult(
        resultType = (result \ "@type").text,
        description = (result \ "description").headOption.map(_.text),
        winner = parseMatchWinner(result \ "winner"),
      ),
    )

  private def parseTeams(teams: NodeSeq): List[Team] =
    teams.map { team =>
      val teamId = (team \ "@id").text
      val teamTagId = CricketTeams.teams.find(_.paId == teamId).map(_.tagId)
      Team(
        (team \ "name").text,
        (team \ "@id").text,
        (team \ "home").text == "true",
        parseTeamLineup(team \ "player"),
        teamTagId,
      )

    }.toList

  private def parseTeamLineup(lineup: NodeSeq): List[String] =
    lineup.map { player => (player \ "name").text }.toList

  private def getStatistic(statistics: NodeSeq, statistic: String): String =
    (statistics \ "statistic").find(node => (node \ "@type").text == statistic).map(_.text).getOrElse("")

  private def parseInnings(innings: NodeSeq): List[Innings] =
    innings
      .map { singleInnings =>
        val inningsOrder = (singleInnings \ "@order").text.toInt
        val battingTeam = (singleInnings \ "batting" \ "team" \ "name").text
        Innings(
          order = inningsOrder,
          battingTeam = battingTeam,
          runsScored = getStatistic(singleInnings, "runs-scored").toInt,
          wickets = getStatistic(singleInnings, "wickets").toInt,
          overs = getStatistic(singleInnings, "overs"),
          declared = getStatistic(singleInnings, "declared") == "true",
          forfeited = getStatistic(singleInnings, "forefeited") == "true",
          description = inningsDescription(inningsOrder, battingTeam),
          batters = parseInningsBatters(singleInnings \ "batting" \ "batter"),
          bowlers = parseInningsBowlers(singleInnings \ "bowling" \ "bowler"),
          fallOfWicket = parseInningsWickets(singleInnings \ "fallenWicket"),
          byes = getStatistic(singleInnings, "extra-byes").toInt,
          legByes = getStatistic(singleInnings, "extra-leg-byes").toInt,
          noBalls = getStatistic(singleInnings, "extra-no-balls").toInt,
          penalties = getStatistic(singleInnings, "extra-penalties").toInt,
          wides = getStatistic(singleInnings, "extra-wides").toInt,
          extras = getStatistic(singleInnings, "extra-total").toInt,
        )
      }
      .toList
      .sortBy(_.order)

  private def parseInningsBatters(batters: NodeSeq): List[InningsBatter] =
    batters
      .map { batter =>
        InningsBatter(
          (batter \ "player" \ "name").text,
          (batter \ "@order").text.toInt,
          getStatistic(batter, "balls-faced") toInt,
          getStatistic(batter, "runs-scored") toInt,
          getStatistic(batter, "fours") toInt,
          getStatistic(batter, "sixes") toInt,
          (batter \ "status").text == "batted",
          (batter \ "dismissal" \ "description").text,
          getStatistic(batter, "on-strike").toInt > 0,
          getStatistic(batter, "runs-scored").toInt > 0,
        )
      }
      .toList
      .sortBy(_.order)

  private def parseInningsBowlers(bowlers: NodeSeq): List[InningsBowler] =
    bowlers
      .map { bowler =>
        InningsBowler(
          (bowler \ "player" \ "name").text,
          (bowler \ "@order").text.toInt,
          getStatistic(bowler, "overs") toInt,
          getStatistic(bowler, "maidens") toInt,
          getStatistic(bowler, "runs-conceded") toInt,
          getStatistic(bowler, "wickets-taken") toInt,
          getStatistic(bowler, "balls") toInt,
        )
      }
      .toList
      .sortBy(_.order)

  private def parseInningsWickets(wickets: NodeSeq): List[InningsWicket] =
    wickets
      .map { wicket =>
        InningsWicket(
          (wicket \ "@order").text.toInt,
          (wicket \ "player" \ "name").text,
          getStatistic(wicket, "runs") toInt,
        )
      }
      .toList
      .sortBy(_.order)

  private def parseOfficials(officials: NodeSeq): List[String] =
    officials.map { official =>
      (official \ "name").text
    }.toList
}
