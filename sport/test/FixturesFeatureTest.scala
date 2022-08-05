package test

import org.scalatest.featurespec.AnyFeatureSpec
import org.scalatest.matchers.should.Matchers
import org.scalatest.{DoNotDiscover, GivenWhenThen}

import scala.jdk.CollectionConverters._
import tools.MatchListFeatureTools

@DoNotDiscover class FixturesFeatureTest
    extends AnyFeatureSpec
    with GivenWhenThen
    with Matchers
    with MatchListFeatureTools
    with ConfiguredTestSuite {

  Feature("Football Fixtures") {

    Scenario("Visit the fixtures page") {

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

    Scenario("Next fixtures") {
      Given("I am on the fixtures page")
      goTo("/football/fixtures") { browser =>
        import browser._

        When("I click the 'Next' fixtures link")

        scrollToElementAndClick("[data-link-name=next]", browser)

        Then("I should see the next set of upcoming matches")
        val matches = $(".football-teams")
        assertFixture(matches, "Swansea", "Reading")
      }
    }

    Scenario("Link tracking") {
      Given("I visit the fixtures page")
      goTo("/football/fixtures/2012/oct/20") { browser =>
        import browser._
        Then("any links I click should be tracked")
        $("a").asScala.filter(link => Option(link.attribute("data-link-name")).isEmpty).foreach { link =>
          fail(s"Link with text ${link.text} has no data-link-name")
        }
      }
    }
  }
}
