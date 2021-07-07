package football.model

import pa._

object GuTeamCodes {
  def codeFor(team: FootballTeam): String = {
    TeamCodes.codeFor(team)
  }
}
