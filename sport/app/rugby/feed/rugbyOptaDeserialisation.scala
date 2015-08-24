package rugby.feed

import org.joda.time.format.DateTimeFormat
import rugby.model.{Team, Match}

import scala.xml.{NodeSeq, XML}

object Parser {

  private object Date {
    private val dateTimeParser = DateTimeFormat.forPattern("yyyyMMdd")

    def apply(dateTime: String) = dateTimeParser.parseDateTime(dateTime)
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
          date = Date((game \ "@game_date").text),
          id = (game \ "@id").text,
          homeTeam = homeTeam,
          awayTeam = awayTeam
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
          date = Date((fixture \ "@game_date").text),
          id = (fixture \ "@id").text,
          homeTeam = homeTeam,
          awayTeam = awayTeam
        )
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
}
