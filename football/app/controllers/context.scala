package controllers

import feed.Competitions

trait CompetitionFixtureFilters {
  def filters = Competitions.withFixturesOnly.competitions.filter(_.matches.nonEmpty).groupBy(_.nation)
    .map {
      case (nation, competitions) =>
        nation -> competitions.map(c => CompetitionFilter(c.fullName, c.url + "/fixtures"))
    }
}

trait CompetitionResultFilters {
  def filters = Competitions.withResultsOnly.competitions.filter(_.matches.nonEmpty).groupBy(_.nation)
    .map {
      case (nation, competitions) =>
        nation -> competitions.map(c => CompetitionFilter(c.fullName, c.url + "/results"))
    }
}