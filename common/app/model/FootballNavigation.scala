package model

object FootballNavigation {

  private val competitionsWithTeams: List[String] = List(
    "/football/premierleague",
    "/football/championship",
    "/football/leagueonefootball",
    "/football/leaguetwofootball",
    "/football/scottishpremierleague",
    "/football/scottish-division-one",
    "/football/scottish-division-two",
    "/football/scottish-division-three",
    "/football/laligafootball",
    "/football/ligue1football",
    "/football/bundesligafootball",
    "/football/serieafootball"
  )

  val defaultNav = Seq(
    Link("/football/tables", "tables", "Tables"),
    Link("/football/live", "livescores", "Live scores"),
    Link("/football/fixtures", "fixtures", "Fixtures"),
    Link("/football/results", "results", "Results"),
    Link("/football/teams", "teams", "Teams"),
    Link("/football/competitions", "leagues and competitions", "Leagues & competitions")
  )

  def navFor(tag: Tag): Seq[Link] = tag match {
    case competition if tag.isFootballCompetition => navFor(tag.url)
    case _ => defaultNav
  }

  def navFor(competition: String): Seq[Link] = if (competitionsWithTeams.contains(competition)) {
    val competitionAnchor = competition.split("/").last
    Seq(
      Link(s"$competition/table", "tables", "Tables"),
      Link(s"$competition/live", "livescores", "Live scores"),
      Link(s"$competition/fixtures", "fixtures", "Fixtures"),
      Link(s"$competition/results", "results", "Results"),
      Link(s"/football/teams#$competitionAnchor", "teams", "Teams"),
      Link(s"/football/competitions", "leagues and competitions", "Leagues & competitions")
    )
  } else {
    Seq(
      Link(s"$competition/table", "tables", "Tables"), // note if there is no table for this comp it will redirect to /football/tables
      Link(s"$competition/live", "livescores", "Live scores"),
      Link(s"$competition/fixtures", "fixtures", "Fixtures"),
      Link(s"$competition/results", "results", "Results"),
      Link(s"/football/competitions", "leagues and competitions", "Leagues & competitions")
    )
  }
}
