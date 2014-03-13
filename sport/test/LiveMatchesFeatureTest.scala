package test

import org.scalatest.{ FeatureSpec, GivenWhenThen }
import org.scalatest.Matchers
import tools.MatchListFeatureTools


class LiveMatchesFeatureTest extends FeatureSpec with GivenWhenThen with Matchers with MatchListFeatureTools {

  feature("Live Matches") {

    scenario("Visit the live matches") {

      Given("I visit the live matches page")

      HtmlUnit("/football/live") { browser =>
        import browser._

        val matches = $(".football-match__team")

        Then("I should see todays live matches")
        assertTeamWithScore(matches, "Arsenal", "1")
        assertTeamWithScore(matches, "Spurs", "0")
        assertTeamWithScore(matches, "Man U", "0")
        assertTeamWithScore(matches, "Chelsea", "0")

        And("Should not show matches that have finished")
        assertNotTeamWithScore(matches, "Sunderland", "1")
        assertNotTeamWithScore(matches, "West Ham", "1")
      }
    }

    scenario("Competition fixtures filter") {

      Given("I am on the premier league live matches page")
      HtmlUnit("/football/premierleague/live") { browser =>
        import browser._

        val matches = $(".football-match__team")

        Then("I should see premier league live games")
        assertTeamWithScore(matches, "Arsenal", "1")
        assertTeamWithScore(matches, "Spurs", "0")

        And("I should not see other leagues games")
        assertNotTeamWithScore(matches, "Cardiff", "2")
      }
    }

    scenario("The 'Classic version' link points to the correct, equivalent classic page") {

      Given("I visit the live page")
      And("I am on the 'UK' edition")
      HtmlUnit("/football/live") { browser =>
        import browser._

        Then("the 'Classic version' link should point to '/football/live?view=classic'")
        findFirst(".js-main-site-link").getAttribute("href") should be(ClassicVersionLink("/football/live"))
      }

      Given("I visit the live page")
      And("I am on the 'US' edition")
      HtmlUnit.US("/football/live") { browser =>
        import browser._

        Then("the 'Classic version' link should point to '/football/matches?view=classic'")
        findFirst(".js-main-site-link").getAttribute("href") should be(ClassicVersionLink("/football/live"))
      }
    }
  }
}
