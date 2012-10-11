package test

import org.scalatest.{ FeatureSpec, GivenWhenThen }
import org.scalatest.matchers.ShouldMatchers

class LiveMatchesTest extends FeatureSpec with GivenWhenThen with ShouldMatchers {

  feature("Live matches page") {

    scenario("Visit the live matches page") {

      given("I visit the live matches page")

      HtmlUnit("/football/live") { browser =>

        import browser._

        then("I should see fixtures for today")

        findFirst(".competitions-date").getText should be("Thursday 11 October 2012")

        val fixture = findFirst(".matches").findFirst(".match-desc")
        fixture.findFirst(".home").getText should be("Chester FC")
        fixture.findFirst(".away").getText should be("FC Halifax")
        findFirst(".status").getText should include("FT")
      }
    }
  }
}
