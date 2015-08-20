package rugby.model

import org.joda.time.DateTime

case class Match(
  date: DateTime,
  id: String,
  homeTeam: Team,
  awayTeam: Team,
  isLive: Boolean
)

case class Team(
  id: String,
  name: String,
  score: Option[Int] = None
)
