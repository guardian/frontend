package test

import org.scalatest.{DoNotDiscover, FeatureSpec, GivenWhenThen, Matchers}
import collection.JavaConversions._
import tools.MatchListFeatureTools

@DoNotDiscover class FixturesFeatureTest extends FeatureSpec with GivenWhenThen with Matchers with MatchListFeatureTools with ConfiguredTestSuite  {

  feature("Football Fixtures") {

    scenario("Visit the fixtures page") {

      Given("I visit the fixtures page")

      goTo("/football/fixtures") { browser =>
        import browser._

        val matches = $(".football-teams")
        Then("I should see upcoming fixtures over the next 3 days")
        assertFixture(matches, "Liverpool", "Man C")
        assertFixture(matches, "Wigan", "Fulham")
        assertFixture(matches, "Stoke", "Everton")

        And("I should not see today's live matches")
        assertNotFixture(matches, "Arsenal", "Spurs")
      }
    }

    scenario("Next fixtures") {
      Given("I am on the fixtures page")
      goTo("/football/fixtures") { browser =>
        import browser._

        When("I click the 'Next' fixtures link")

        findFirst("[data-link-name=next]").click()

        Then("I should see the next set of upcoming matches")
        val matches = $(".football-teams")
        assertFixture(matches, "Swansea", "Reading")
      }
    }

    scenario("Link tracking") {
      Given("I visit the fixtures page")
      goTo("/football/fixtures/2012/oct/20") { browser =>
        import browser._
        Then("any links I click should be tracked")
        $("a").filter(link => !Option(link.getAttribute("data-link-name")).isDefined).foreach { link =>
          fail(s"Link with text ${link.getText} has no data-link-name")
        }
      }
    }
  }
}
