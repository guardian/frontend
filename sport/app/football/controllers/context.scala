package football.controllers

import feed.CompetitionsService

trait CompetitionFixtureFilters {
  def competitionsService: CompetitionsService
  def filters: Map[String, Seq[CompetitionFilter]] =
    competitionsService.competitionsWithTodaysMatchesAndFutureFixtures.competitions
      .filter(_.matches.nonEmpty)
      .groupBy(_.nation)
      .map {
        case (nation, comps) =>
          nation -> comps.map(c => CompetitionFilter(c.fullName, s"${c.url}/fixtures"))
      }
}

trait CompetitionResultFilters {
  def competitionsService: CompetitionsService
  def filters: Map[String, Seq[CompetitionFilter]] =
    competitionsService.competitionsWithTodaysMatchesAndPastResults.competitions
      .filter(_.matches.nonEmpty)
      .groupBy(_.nation)
      .map {
        case (nation, comps) =>
          nation -> comps.map(c => CompetitionFilter(c.fullName, s"${c.url}/results"))
      }
}

trait CompetitionLiveFilters {
  def competitionsService: CompetitionsService
  def filters: Map[String, Seq[CompetitionFilter]] =
    competitionsService.withTodaysMatches.competitions
      .filter(_.matches.nonEmpty)
      .groupBy(_.nation)
      .map {
        case (nation, comps) =>
          nation -> comps.map(c => CompetitionFilter(c.fullName, s"${c.url}/live"))
      }
}

trait CompetitionListFilters {
  def competitionsService: CompetitionsService
  def filters: Map[String, Seq[CompetitionFilter]] =
    competitionsService.competitions
      .filter(_.matches.nonEmpty)
      .groupBy(_.nation)
      .map {
        case (nation, comps) =>
          nation -> comps.map(c => CompetitionFilter(c.fullName, c.url))
      }
}

trait CompetitionTableFilters {
  def competitionsService: CompetitionsService
  def filters: Map[String, Seq[CompetitionFilter]] =
    competitionsService.competitionsWithTodaysMatchesAndFutureFixtures.competitions
      .filter(_.hasLeagueTable)
      .groupBy(_.nation)
      .map {
        case (nation, comps) =>
          nation -> comps.map(c => CompetitionFilter(c.fullName, s"${c.url}/table"))
      }
}
