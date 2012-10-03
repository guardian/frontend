package views

import pa.{ MatchDayTeam, Team }

object ShortName {

  val names = Map("44" -> "Wolves")

  def apply(team: MatchDayTeam) = {
    names.get(team.id).getOrElse(team.name)
  }

}