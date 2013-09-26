package test

import org.scalatest.{ FeatureSpec, GivenWhenThen }
import org.scalatest.matchers.ShouldMatchers

class LiveMatchesFeatureTest extends FeatureSpec with GivenWhenThen with ShouldMatchers {

  feature("Live Matches") {

    scenario("Visit the live matches") {

      Given("I visit the live matches page")

      HtmlUnit("/football/live") { browser =>
        import browser._
        Then("I should see todays live matches")
        val matches = $(".match-desc").getTexts
        matches should contain ("Arsenal 1-0 Spurs")
        matches should contain ("Chelsea 0-0 Man U")
        matches should contain ("Sunderland 1-1 West Ham")
      }
    }

    scenario("Competition fixtures filter") {

      Given("I am on the premier league live matches page")
      HtmlUnit("/football/premierleague/live") { browser =>
        import browser._
        Then("I should see premier league live games")
        $(".match-desc").getTexts should contain ("Arsenal 1-0 Spurs")

        And("I should not see other leagues games")
        $(".match-desc").getTexts should not contain ("Cardiff 2-0 Brighton")
      }
    }

    scenario("The 'Desktop version' link points to the correct, equivalent desktop page") {

      Given("I visit the live page")
      And("I am on the 'UK' edition")
      HtmlUnit("/football/live") { browser =>
        import browser._

        Then("the 'Desktop version' link should point to '/football/live?view=desktop'")
        findFirst(".js-main-site-link").getAttribute("href") should be("http://localhost:9000/football/live?view=desktop")
      }

      Given("I visit the live page")
      And("I am on the 'US' edition")
      HtmlUnit.US("/football/live") { browser =>
        import browser._

        Then("the 'Desktop version' link should point to '/football/matches?view=desktop'")
        findFirst(".js-main-site-link").getAttribute("href") should be("http://localhost:9000/football/live?view=desktop")
      }

    }

  }
}
