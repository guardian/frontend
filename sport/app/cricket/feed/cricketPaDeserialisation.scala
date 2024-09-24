package conf.cricketPa

import com.madgag.scala.collection.decorators.MapDecorator
import common.Chronos
import cricket.feed.PlayerNames

import xml.{Node, NodeSeq, XML}
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
    val teams = parseTeams(lineupData \ "match" \ "team")

    Match(
      teams,
      parseInnings(scorecardData \ "match" \ "innings", teams),
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
      val players = parseTeamLineup(team \ "player")
      Team((team \ "name").text, (team \ "@id").text, (team \ "home").text == "true", players.map(_.name), players)

    }.toList

  private def parsePlayer(player: Node): Player = Player(
    id = (player \ "id").text,
    name = (player \ "name").text,
    firstName = (player \ "firstName").text,
    lastName = (player \ "lastName").text,
    initials = (player \ "initials").text,
  )

  private def parseTeamLineup(lineup: NodeSeq): List[Player] = lineup.map(parsePlayer).toList

  private def getStatistic(statistics: NodeSeq, statistic: String): String =
    (statistics \ "statistic").find(node => (node \ "@type").text == statistic).map(_.text).getOrElse("")

  private def parseInnings(innings: NodeSeq, teams: List[Team]): List[Innings] =
    innings
      .map { singleInnings =>
        val inningsOrder = (singleInnings \ "@order").text.toInt
        val battingTeam = (singleInnings \ "batting" \ "team" \ "name").text

        val bowlingTeamName = (singleInnings \ "bowling" \ "team" \ "name").text
        val bowlingTeam = teams.find(_.name == bowlingTeamName)

        Innings(
          inningsOrder,
          battingTeam,
          getStatistic(singleInnings, "runs-scored").toInt,
          getStatistic(singleInnings, "overs"),
          getStatistic(singleInnings, "declared") == "true",
          getStatistic(singleInnings, "forefeited") == "true",
          inningsDescription(inningsOrder, battingTeam),
          parseInningsBatters(singleInnings \ "batting" \ "batter", bowlingTeam),
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

  case class Dismissal(items: Seq[(String, String)]) {

    def description(dismissal: NodeSeq, f: Player => String): String = {
      for {
        (nodeName, prefix) <- items
      } yield {
        s"$prefix ${f(parsePlayer((dismissal \ nodeName \ "player").head))}"
      }
    }.mkString(" ")

  }

  val dismissalTypes: Map[String, Dismissal] = Map(
    "caught" -> Seq("caughtBy" -> "st", "bowledBy" -> "b"), // c Rathnayake b de Silva
    "caught-sub" -> Seq("bowledBy" -> "c Sub b"), // c Sub b Kumara
    "caught-and-bowled" -> Seq("caughtBy" -> "c & b"), // c &amp; b Woakes
    "stumped" -> Seq("caughtBy" -> "st", "bowledBy" -> "b"), // st Ambrose b Patel
    "run-out" -> Seq("caughtBy" -> "Run Out"), // Run Out Stone
    "lbw" -> Seq("bowledBy" -> "lbw b"), // lbw b Stone
    "bowled" -> Seq("bowledBy" -> "b"), // b Kumara
  ).mapV(Dismissal)

  def parseDismissal(dismissal: NodeSeq, bowlingTeamOpt: Option[Team]): String = {
    val description = (dismissal \ "description").text
    (
      for {
        bowlingTeam <- bowlingTeamOpt
        dismissalDescriber <- dismissalTypes.get(dismissal \@ "type")
        if description == dismissalDescriber.description(dismissal, _.lastName)
      } yield {
        dismissalDescriber.description(
          dismissal,
          player => bowlingTeam.uniquePlayerNames.getOrElse(player.id, player.name),
        )
      }
    ).getOrElse(description)
  }

  private def parseInningsBatters(batters: NodeSeq, bowlingTeam: Option[Team]): List[InningsBatter] = {

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
          parseDismissal(batter \ "dismissal", bowlingTeam),
          getStatistic(batter, "on-strike").toInt > 0,
          getStatistic(batter, "runs-scored").toInt > 0,
        )
      }
      .toList
      .sortBy(_.order)
  }

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
