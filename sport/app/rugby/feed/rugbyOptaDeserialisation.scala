package rugby.feed

import rugby.model.{Team, LiveScore}

import scala.xml.{NodeSeq, XML}

object Parser {

  def parseLiveScores(body: String): Seq[LiveScore] = {

    val data = XML.loadString(body)

    val teamsData = data \ "teams" \ "team"
    val gamesData = data \ "game"

    val teams = parseTeams(teamsData)

    gamesData.flatMap { game =>

      val teamsNodes = game \ "team"

      for {
        homeTeam <- getTeamWithScore(teamsNodes, teams, "home")
        awayTeam <- getTeamWithScore(teamsNodes, teams, "away")
      } yield {
        LiveScore(
          id = (game \ "@id").text,
          homeTeam = homeTeam,
          awayTeam = awayTeam
        )
      }
    }
  }

  private def getTeamWithScore(teamNodes: NodeSeq, teams: Seq[Team], status: String): Option[Team] = {
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

  private def parseTeams(teamsData: NodeSeq): Seq[Team] = {
    teamsData.map { team =>
      Team((team \ "@id").text,
        (team \ "@name").text)
    }
  }
}
