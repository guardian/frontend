package common

object TeamCompetitions {

  val competitions: List[String] = List(
    "Premier League",
    "Championship",
    "League One",
    "League Two",
    "Scottish Premier League",
    "Scottish Division One",
    "Scottish Division Two",
    "Scottish Division Three",
    "La Liga",
    "Ligue 1",
    "Bundesliga",
    "Serie A"
  )

  // is the supplied competition a 'team' competition, i.e. does it appear in the /football/teams pgge
  def apply(competitionName: String): Boolean = competitions.contains(competitionName)

}