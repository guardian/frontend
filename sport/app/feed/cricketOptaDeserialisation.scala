package cricketOpta

import xml.{NodeSeq, XML}
import scala.language.postfixOps
import org.joda.time.format.DateTimeFormat
import org.joda.time.DateTime
import cricketModel._

object Parser {

  def parseMatch(s: String): Match = {
    val parser = new Parser
    parser.parseMatch(s)
  }
}

class Parser {

  private def parseMatch(s: String): Match = {

    val xml = XML.loadString(s)
    val matchDetail = parseMatchDetail( xml \ "MatchDetail")
    mapPlayersWithIds( xml \ "PlayerDetail" \ "Team" \ "Player")
    mapTeamsWithIds( xml \ "PlayerDetail" \ "Team" )

    Match(
      parseTeams(xml),
      parseInnings( xml \ "Innings"),
      matchDetail.competitionName,
      matchDetail.description,
      matchDetail.venueName,
      matchDetail.result,
      matchDetail.gameDate,
      matchDetail.officials
    )
  }

  private val players = collection.mutable.Map.empty[Int, String]
  private val teams = collection.mutable.Map.empty[Int, String]

  private case class MatchDetail(
                          competitionName: String,
                          description: String,
                          venueName: String,
                          result: String,
                          gameDate: DateTime,
                          officials: List[String])

  private object Date {
    private val dateTimeParser = DateTimeFormat.forPattern("yyyy-MM-dd HH:mm:ss")

    def apply(date: String, time: String) = dateTimeParser.parseDateTime("%s %s".format(date, time))
  }

  private def mapPlayersWithIds(playerDetail: NodeSeq)
  {
    playerDetail.map { player =>
      players((player \ ("@" + "id")).text.toInt) = (player \ ("@player_name")).text
    }
  }

  private def mapTeamsWithIds(teamDetail: NodeSeq)
  {
    teamDetail.map { team =>
      teams((team \ ("@" + "team_id")).text.toInt) = (team \ ("@team_name")).text
    }
  }

  private def inningsDescription(inningsId:Int, battingTeamId:Int): String =
  {
    // Construct a string consisting of the team name and an innings index.
    inningsId match {
      case 1 => s"${teams(battingTeamId)} first innings"
      case 2 => s"${teams(battingTeamId)} first innings"
      case _ => s"${teams(battingTeamId)} second innings"
    }
  }

  private def parseMatchDetail(matchDetail: NodeSeq) :MatchDetail = MatchDetail(
    matchDetail \ "@competition_name" text,
    matchDetail \ "@description" text,
    matchDetail \ "Venue" \ "@venue_name" text,
    matchDetail \ "@result" text,
    Date( matchDetail \ "@game_date" text,
          matchDetail \ "@game_time" text),
    parseOfficials(matchDetail \ "Officials")
  )

  private def parseTeams(matchSummary: NodeSeq) :List[Team] =
    // It is possible for the feed to return a match summary with no Player Detail.
    // In this case, use the match detail to generate a hollow team.
    (matchSummary \ "PlayerDetail" \ "Team") match {
      case empty if (empty.isEmpty ) => List(
                                            Team( (matchSummary \ "MatchDetail" \ "@home_team").text,
                                                  (matchSummary \ "MatchDetail" \ "@home_team_id").text.toInt,
                                                  "home",Nil),
                                            Team( (matchSummary \ "MatchDetail" \ "@away_team").text,
                                                  (matchSummary \ "MatchDetail" \ "@away_team_id").text.toInt,
                                                  "away",Nil))
      case teams => teams.map { team =>
                      Team( (team \ "@team_name").text,
                        (team \ "@team_id").text.toInt,
                        (team \ "@home_or_away").text,
                        parseTeamLineup(team \ "Player"))
                    }.toList

    }

  private def parseTeamLineup(lineup: NodeSeq) :List[String] =
    lineup.map { player => player \ "@player_name" text }.toList

  private def parseInnings(innings: NodeSeq) :List[Innings] =
    innings.map { singleInnings =>
      val inningsId = (singleInnings \ "@id").text.toInt
      val battingTeamId = (singleInnings \ "@batting_team_id").text.toInt
      Innings(  inningsId,
                battingTeamId,
                (singleInnings \ "Total" \ "@runs_scored").text.toInt,
                (singleInnings \ "Total" \ "@overs").text,
                (singleInnings \ "@declared").text.toInt > 0,
                (singleInnings \ "@forfeited").text.toInt > 0,
                inningsDescription(inningsId, battingTeamId),
                parseInningsBatsmen(singleInnings \ "Batsmen" \ "Batsman"),
                parseInningsBowlers(singleInnings \ "Bowlers" \ "Bowler"),
                parseInningsWickets(singleInnings \ "FallofWickets" \ "FallofWicket"),
                (singleInnings \ "Extras" \ "@byes").text.toInt,
                (singleInnings \ "Extras" \ "@leg_byes").text.toInt,
                (singleInnings \ "Extras" \ "@no_balls").text.toInt,
                (singleInnings \ "Extras" \ "@penalties").text.toInt,
                (singleInnings \ "Extras" \ "@wides").text.toInt,
                (singleInnings \ "Extras" \ "@total_extras").text.toInt)
    }.toList.sortBy(_.id)

  private def parseInningsBatsmen(batsmen: NodeSeq) :List[InningsBatsman] =
    batsmen.map { batsman =>
      ((batsman \ "@balls_faced").text ) match {
        case didNotBat: String if (didNotBat.isEmpty ) => None
        case ballsFaced => Some[InningsBatsman](InningsBatsman(
                              players((batsman \ "@id").text.toInt),
                              ballsFaced.toInt,
                              (batsman \ "@runs_scored").text.toInt,
                              (batsman \ "@fours_scored").text.toInt,
                              (batsman \ "@sixes_scored").text.toInt,
                              (batsman \ "@how_out").text != "Not Out",
                              (batsman \ "@how_out").text,
                              (batsman \ "@on_strike").text.toInt > 0,
                              (batsman \ "@non_strike").text.toInt > 0))
      }
    }.flatten.toList

  private def parseInningsBowlers(bowlers: NodeSeq) :List[InningsBowler] =
    bowlers.map { bowler =>
      InningsBowler(
        players((bowler \ "@id").text.toInt),
        (bowler \ "@overs_bowled").text toInt,
        (bowler \ "@maidens_bowled").text.toInt,
        (bowler \ "@runs_conceded").text.toInt,
        (bowler \ "@wickets_taken").text.toInt,
        (bowler \ "@on_strike").text.toInt > 0,
        (bowler \ "@non_strike").text.toInt > 0)
    }.toList

  private def parseInningsWickets(wickets: NodeSeq) :List[InningsWicket] =
    wickets.map { wicket =>
      InningsWicket(
        (wicket \ "@order").text.toInt,
        players((wicket \ "@player_id").text.toInt),
        (wicket \ "@runs").text.toInt)
    }.toList

  private def parseOfficials(officials: NodeSeq) :List[String]=
    // If the feed has empty string officials, just return  default string
    (officials \ "@official_1_id").text match {
      case empty:String if (empty.isEmpty) => List("Umpires yet to be announced")
      case _ =>
        List(s"${(officials \ "@official_1_first_name").text} ${(officials \ "@official_1_last_name").text}",
             s"${(officials \ "@official_2_first_name").text} ${(officials \ "@official_2_last_name").text}",
             s"${(officials \ "@official_3_first_name").text} ${(officials \ "@official_3_last_name").text}",
             s"${(officials \ "@official_4_first_name").text} ${(officials \ "@official_4_last_name").text}",
             s"${(officials \ "@official_5_first_name").text} ${(officials \ "@official_5_last_name").text}")
    }
}
