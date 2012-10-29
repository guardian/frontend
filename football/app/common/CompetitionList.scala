package common

case class CompetitionLink(href: String, title: String)

case class Competition(name: String, competitions: Seq[CompetitionLink])

object CompetitionList {
  def apply() = {

    val comps = Seq(

      Competition("English", Seq(
        CompetitionLink("/football/premierleague", "Premier league"),
        CompetitionLink("/football/championship", "Championship"),
        CompetitionLink("/football/leagueonefootball", "League one"),
        CompetitionLink("/football/leaguetwofootball", "League two"),
        CompetitionLink("/football/fa-cup", "FA Cup"),
        CompetitionLink("/football/capital-one-cup", "League Cup")
      )),

      Competition("European", Seq(
        CompetitionLink("/football/championsleague", "Champions League"),
        CompetitionLink("/football/uefa-europa-league", "Europa League"),
        CompetitionLink("/football/laligafootball", "La Liga (SPA)")
      )),

      Competition("Scottish", Seq(
        CompetitionLink("/football/scottishpremierleague", "Premier League"),
        CompetitionLink("/football/scottish-division-one", "Division one"),
        CompetitionLink("/football/scottish-division-two", "Division two"),
        CompetitionLink("/football/scottish-division-three", "Division three"),
        CompetitionLink("/football/scottishcup", "FA Cup"),
        CompetitionLink("/football/cis-insurance-cup", "League Cup")
      )),

      Competition("Internationals", Seq(
        CompetitionLink("/football/world-cup-2014-qualifiers", "World Cup Qualifying")
      ))

    ) //End zones

    comps

  }
}