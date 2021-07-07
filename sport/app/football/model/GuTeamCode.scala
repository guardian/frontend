package football.model

import pa._

object GuTeamCodes {
  def codeFor(team: FootballTeam): String = {

    // Date: June 2021
    // Author: Pascal

    // Introducing this function to patches pa.TeamCodes.codeFor in order to replace the currently PA incorrect
    // short code for North Macedonia. PA's current library says "MAC", but the correct value is "MKD".
    // This is a temporary fix. The, better, long term fix is to upgrade the PA library (and check that the new library
    // come with the correct value for North Macedonia), at which point this object should be removed.

    val code = TeamCodes.codeFor(team)
    if (code == "MAC") {
      "MKD"
    } else {
      code
    }
  }
}
