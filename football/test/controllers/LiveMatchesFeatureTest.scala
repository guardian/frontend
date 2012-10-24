package test

import org.scalatest.{ FeatureSpec, GivenWhenThen }
import org.scalatest.matchers.ShouldMatchers

class LiveMatchesFeatureTest extends FeatureSpec with GivenWhenThen with ShouldMatchers {

  // just checking these pages actually load

  feature("Live Matches") {

    scenario("Visit the live matches") {

      given("I visit the live matches page")

      HtmlUnit("/football/live") { browser =>
        then("I should see todays live matches")
      }
    }

    scenario("Competition fixtures filter") {

      given("I am on the premier league live matches page")
      HtmlUnit("/football/premierleague/live") { browser =>
        then("I should see premier league live games")
      }
    }
  }
}
