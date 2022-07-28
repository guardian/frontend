package test

import org.scalatest.featurespec.AnyFeatureSpec
import org.scalatest.matchers.should.Matchers
import org.scalatest.{DoNotDiscover, GivenWhenThen}
import tools.MatchListFeatureTools

@DoNotDiscover class LiveMatchesFeatureTest
    extends AnyFeatureSpec
    with GivenWhenThen
    with Matchers
    with MatchListFeatureTools
    with ConfiguredTestSuite {

  Feature("Live Matches") {

    Scenario("Visit the live matches") {

      Given("I visit the live matches page")

      goTo("/football/live") { browser =>
        import browser._

        val matches = $(".football-match__team")

        Then("I should see today's live matches")
        assertTeamWithScore(matches, "Arsenal", "1")
        assertTeamWithScore(matches, "Spurs", "0")
        assertTeamWithScore(matches, "Man U", "0")
        assertTeamWithScore(matches, "Chelsea", "0")

        And("Should also show today's results")
        assertTeamWithScore(matches, "Sunderland", "1")
        assertTeamWithScore(matches, "West Ham", "1")
      }
    }

    Scenario("Competition fixtures filter") {

      Given("I am on the premier league live matches page")
      goTo("/football/premierleague/live") { browser =>
        import browser._

        val matches = $(".football-match__team")

        Then("I should see premier league live games")
        assertTeamWithScore(matches, "Arsenal", "1")
        assertTeamWithScore(matches, "Spurs", "0")

        And("I should not see other leagues games")
        assertNotTeamWithScore(matches, "Cardiff", "2")
      }
    }
  }
}
