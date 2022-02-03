package football.feed

import feed.Competitions
import test.{ConfiguredTestSuite, FootballTestData}

class CompetitionsTest {
  val competitions = Competitions(FootballTestData.competitions)
}
