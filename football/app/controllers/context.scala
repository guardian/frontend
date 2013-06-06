package controllers

import feed.Competitions

trait CompetitionFixtureFilters {
  def filters = Competitions.withTodaysMatchesAndFutureFixtures.competitions.filter(_.matches.nonEmpty).groupBy(_.nation)
    .map {
      case (nation, competitions) =>
        nation -> competitions.map(c => CompetitionFilter(c.fullName, s"${c.url}/fixtures"))
    }
}

trait CompetitionResultFilters {
  def filters = Competitions.withTodaysMatchesAndPastResults.competitions.filter(_.matches.nonEmpty).groupBy(_.nation)
    .map {
      case (nation, competitions) =>
        nation -> competitions.map(c => CompetitionFilter(c.fullName, s"${c.url}/results"))
    }
}

trait CompetitionLiveFilters {
  def filters = Competitions.withTodaysMatches.competitions.filter(_.matches.nonEmpty).groupBy(_.nation)
    .map {
      case (nation, competitions) =>
        nation -> competitions.map(c => CompetitionFilter(c.fullName, s"${c.url}/live"))
    }
}

trait CompetitionListFilters {
  def filters = Competitions.competitions.filter(_.matches.nonEmpty).groupBy(_.nation)
    .map {
      case (nation, competitions) =>
        nation -> competitions.map(c => CompetitionFilter(c.fullName, c.url))
    }
}

trait CompetitionTableFilters {
  def filters = Competitions.withTodaysMatchesAndFutureFixtures.competitions.filter(_.hasLeagueTable).groupBy(_.nation)
    .map {
      case (nation, competitions) =>
        nation -> competitions.map(c => CompetitionFilter(c.fullName, s"${c.url}/table"))
    }
}