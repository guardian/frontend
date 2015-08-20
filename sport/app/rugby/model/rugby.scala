package rugby.model

import org.joda.time.DateTime

case class Match(
  date: DateTime,
  id: String,
  homeTeam: Team,
  awayTeam: Team
) {
  def hasTeam(teamId: String) = homeTeam.id == teamId || awayTeam.id == teamId
}

case class Team(
  id: String,
  name: String,
  score: Option[Int] = None
)
