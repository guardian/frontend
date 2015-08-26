package rugby.model

import org.joda.time.DateTime

case class Match(
  date: DateTime,
  id: String,
  homeTeam: Team,
  awayTeam: Team,
  venue: Option[String],
  competitionName: String
) {
  def hasTeam(teamId: String) = homeTeam.id == teamId || awayTeam.id == teamId
}

case class Team(
  id: String,
  name: String,
  score: Option[Int] = None
)

case class Player(
  id: String,
  name: String,
  team: Team
)

case class ScoreEvent(
  player: Player,
  minute: String,
  `type`: ScoreType.Value
)

object ScoreType extends Enumeration {
  val `Try` = Value("Try")
  val Conversion = Value("Conversion")
  val Penalty = Value("Penalty")
}
