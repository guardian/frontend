package model

import feed.FixtureAgent
import org.joda.time.Interval

case class Competition(url: String, fullName: String, shortName: String, fixturesAgent: FixtureAgent) {
  def hasFixtures = fixturesAgent() nonEmpty
  def fixtures = fixturesAgent()
  def fixturesFor(interval: Interval) = fixtures.filter(f => interval.contains(f.fixtureDate))
}
