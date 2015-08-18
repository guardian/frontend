package rugby.model

import org.joda.time.DateTime

case class LiveScore(
  date: DateTime,
  id: String,
  homeTeam: Team,
  awayTeam: Team
)

case class Team(
  id: String,
  name: String,
  score: Option[Int] = None
)
