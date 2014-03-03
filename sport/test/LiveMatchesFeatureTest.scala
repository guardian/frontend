package test

import org.scalatest.{ FeatureSpec, GivenWhenThen }
import org.scalatest.Matchers

class LiveMatchesFeatureTest extends FeatureSpec with GivenWhenThen with Matchers {

  feature("Live Matches") {

    scenario("Visit the live matches") {

      Given("I visit the live matches page")

      HtmlUnit("/football/live") { browser =>
        import browser._
        Then("I should see todays live matches")
        val matches = $(".details__match-teams").getTexts
        matches should contain ("Arsenal 1 - 0 Spurs")
        matches should contain ("Chelsea 0 - 0 Man U")
        matches should contain ("Sunderland 1 - 1 West Ham")
      }
    }

    scenario("Competition fixtures filter") {

      Given("I am on the premier league live matches page")
      HtmlUnit("/football/premierleague/live") { browser =>
        import browser._
        Then("I should see premier league live games")
        $(".details__match-teams").getTexts should contain ("Arsenal 1 - 0 Spurs")

        And("I should not see other leagues games")
        $(".details__match-teams").getTexts should not contain ("Cardiff 2 - 0 Brighton")
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
