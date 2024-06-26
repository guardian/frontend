package football.model

import pa._

object GuTeamCodes {
  def codeFor(team: FootballTeam): String = {

    // Date: June 2021, Updated July 2023 to include more incorrect codes
    // Author: Pascal

    // Introducing this function to patches pa.TeamCodes.codeFor in order to replace the currently PA incorrect
    // short codes below.
    // This is a temporary fix. The, better, long term fix is to upgrade the PA library (and check that the new library
    // comes with the correct values), at which point this object should be removed.

    // We need to match on name, as South Africa and South Korea both default to "SOU"
    team.name match {
      case "China PR"        => "CHN"
      case "Costa Rica"      => "CRC"
      case "Germany"         => "GER"
      case "Japan"           => "JPN"
      case "Morocco"         => "MAR"
      case "Nigeria"         => "NGA"
      case "Netherlands"     => "NED"
      case "North Macedonia" => "MKD"
      case "New Zealand"     => "NZL"
      case "Portugal"        => "POR"
      case "Rep of Ireland"  => "IRL"
      case "South Africa"    => "RSA"
      case "South Korea"     => "KOR"
      case "Spain"           => "SPA"
      case "Switzerland"     => "SUI"
      case _                 => TeamCodes.codeFor(team)
    }
  }
}
