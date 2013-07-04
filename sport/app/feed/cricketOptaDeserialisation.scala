package cricketOpta

import xml.{NodeSeq, XML}
import scala.language.postfixOps
import org.joda.time.format.DateTimeFormat
import org.joda.time.DateTime

case class CricketMatchSummary(
             teams: List[Team],
             innings: List[Innings],
             sessions: List[Session],
             matchDetail: MatchDetail)

case class MatchDetail(
              competitionName: String,
              description: String,
              venueName: String,
              result: String,
              gameDate: DateTime)

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
              wickets: Int,
              declared: Boolean,
              forfeited: Boolean) extends cricketModel.Innings

object Parser {

  private object Date {

    private val dateTimeParser = DateTimeFormat.forPattern("yyyy-MM-dd HH:mm:ss")

    def apply(date: String, time: String) = dateTimeParser.parseDateTime("%s %s".format(date, time))
  }

  def parseMatch(s: String): CricketMatchSummary = {

    val xml = XML.loadString(s)

    def parseMatchDetail(matchDetail: NodeSeq) = MatchDetail(
      matchDetail \ ("@" + "competition_name") text,
      matchDetail \ ("@" + "description") text,
      matchDetail \ "Venue" \ ("@" + "venue_name") text,
      matchDetail \ ("@" + "result") text,
      Date( matchDetail \ ("@" + "game_date") text,
            matchDetail \ ("@" + "game_time") text)
    )

    def parseTeams(teams: NodeSeq) =
      teams.map { team =>
          Team( (team \ ("@" + "team_name")) text,
                (team \ ("@" + "team_id")).text toInt,
                (team \ ("@" + "home_or_away")) text)
    }.toList

    def parseInnings(innings: NodeSeq) =
      innings.map { singleInnings =>
          Innings( (singleInnings \ ("@" + "id")).text toInt,
                   (singleInnings \ ("@" + "batting_team_id")).text toInt,
                   (singleInnings \ "Total" \ ("@" + "runs_scored")).text toInt,
                   (singleInnings \ "Total" \ ("@" + "overs") text),
                   (singleInnings \ "Total" \ ("@" + "wickets")).text toInt,
                   (singleInnings \ ("@" + "declared")).text.toInt > 0,
                   (singleInnings \ ("@" + "forfeited")).text.toInt > 0)
    }.toList

    def parseSessions(sessions: NodeSeq) =
      sessions.map { session =>
          Session( (session \ ("@" + "day")).text)
    }.toList

    CricketMatchSummary(
      parseTeams( xml \ "PlayerDetail" \ "Team"),
      parseInnings( xml \ "Innings"),
      parseSessions( xml \ "SessionUpdates" \ "session"),
      parseMatchDetail( xml \ "MatchDetail")
    )
  }
}
