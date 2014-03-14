package test

import org.scalatest.{ FeatureSpec, GivenWhenThen }
import org.scalatest.Matchers
import org.fluentlenium.core.domain.{FluentWebElement, FluentList}
import collection.JavaConversions._
import tools.MatchListFeatureTools


class FixturesFeatureTest extends FeatureSpec with GivenWhenThen with Matchers with MatchListFeatureTools {

  feature("Football Fixtures") {

    scenario("Visit the fixtures page") {

      Given("I visit the fixtures page")

      HtmlUnit("/football/fixtures") { browser =>
        import browser._

        val matches = $(".football-teams")
        Then("I should see upcoming fixtures over the next 3 days")
        assertFixture(matches, "Liverpool", "Man C")
        assertFixture(matches, "Wigan", "Fulham")
        assertFixture(matches, "Stoke", "Everton")

        And("I should not see today's live matches")
        assertNotFixture(matches, "Arsenal", "Spurs")

        And("Team form should be shown with matches")
        $(".football-team__form").size() should be($(".football-match__team").size())
      }
    }

    scenario("Next fixtures") {
      Given("I am on the fixtures page")
      HtmlUnit("/football/fixtures") { browser =>
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
      HtmlUnit("/football/fixtures/2012/oct/20") { browser =>
        import browser._
        Then("any links I click should be tracked")
        $("a").filter(link => !Option(link.getAttribute("data-link-name")).isDefined).foreach { link =>
          fail(s"Link with text ${link.getText} has no data-link-name")
        }
      }
    }

    scenario("The 'Classic version' link points to the correct, equivalent classic page") {

      Given("I visit the fixtures page")
      And("I am on the 'UK' edition")
      HtmlUnit("/football/fixtures") { browser =>
        import browser._

        Then("the 'Classic version' link should point to '/football/fixtures?view=classic'")
        findFirst(".js-main-site-link").getAttribute("href") should be(ClassicVersionLink("/football/fixtures"))
      }

      Given("I visit the fixtures page")
      And("I am on the 'US' edition")
      HtmlUnit.US("/football/fixtures") { browser =>
        import browser._

        Then("the 'Classic version' link should point to '/football/fixtures?view=classic'")
        findFirst(".js-main-site-link").getAttribute("href") should be(ClassicVersionLink("/football/fixtures"))
      }
    }
  }
}
