package rugby.model

case class LiveScore(
  id: String,
  homeTeam: Team,
  awayTeam: Team
)

case class Team(
  id: String,
  name: String,
  score: Option[Int] = None
)
