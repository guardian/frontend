package conf.cricketPa

import common.Chronos

import xml.{NodeSeq, XML}
import scala.language.postfixOps
import cricketModel._

import java.time.LocalDateTime
import java.util.TimeZone

object Parser {

  def parseMatch(scorecard: String, detail: String, lineups: String, matchId: String): Match = {

    val matchData = XML.loadString(detail) \ "match"
    val matchDetail = parseMatchDetail(matchData)
    val lineupData = XML.loadString(lineups)
    val scorecardData = XML.loadString(scorecard)

    Match(
      parseTeams(lineupData \ "match" \ "team"),
      parseInnings(scorecardData \ "match" \ "innings"),
      matchDetail.competitionName,
      matchDetail.venueName,
      matchDetail.result,
      matchDetail.gameDate,
      matchDetail.officials,
      matchId,
    )
  }

  private case class MatchDetail(
      competitionName: String,
      venueName: String,
      result: String,
      gameDate: LocalDateTime,
      officials: List[String],
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
      matchDetail \ "stage" text,
      matchDetail \ "venue" \ "name" text,
      matchDetail \ "status" text,
      Date(matchDetail \ "dateTime" text),
      parseOfficials(matchDetail \ "official"),
    )

  private def parseTeams(teams: NodeSeq): List[Team] =
    teams.map { team =>
      Team((team \ "name").text, (team \ "@id").text, (team \ "home").text == "true", parseTeamLineup(team \ "player"))

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
          inningsOrder,
          battingTeam,
          getStatistic(singleInnings, "runs-scored").toInt,
          getStatistic(singleInnings, "overs"),
          getStatistic(singleInnings, "declared") == "true",
          getStatistic(singleInnings, "forefeited") == "true",
          inningsDescription(inningsOrder, battingTeam),
          parseInningsBatsmen(singleInnings \ "batting" \ "batter"),
          parseInningsBowlers(singleInnings \ "bowling" \ "bowler"),
          parseInningsWickets(singleInnings \ "fallenWicket"),
          getStatistic(singleInnings, "extra-byes").toInt,
          getStatistic(singleInnings, "extra-leg-byes").toInt,
          getStatistic(singleInnings, "extra-no-balls").toInt,
          getStatistic(singleInnings, "extra-penalties").toInt,
          getStatistic(singleInnings, "extra-wides").toInt,
          getStatistic(singleInnings, "extra-total").toInt,
        )
      }
      .toList
      .sortBy(_.order)

  private def parseInningsBatsmen(batsmen: NodeSeq): List[InningsBatsman] =
    batsmen
      .map { batsman =>
        InningsBatsman(
          (batsman \ "player" \ "name").text,
          (batsman \ "@order").text.toInt,
          getStatistic(batsman, "balls-faced") toInt,
          getStatistic(batsman, "runs-scored") toInt,
          getStatistic(batsman, "fours") toInt,
          getStatistic(batsman, "sixes") toInt,
          (batsman \ "status").text == "batted",
          (batsman \ "dismissal" \ "description").text,
          getStatistic(batsman, "on-strike").toInt > 0,
          getStatistic(batsman, "runs-scored").toInt > 0,
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
