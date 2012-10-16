package test

import org.scalatest.{ FeatureSpec, GivenWhenThen }
import org.scalatest.matchers.ShouldMatchers
import org.joda.time.DateMidnight

class LiveMatchesTest extends FeatureSpec with GivenWhenThen with ShouldMatchers {

  feature("Live matches page") {

    ignore("Visit the live matches page") {

      given("I visit the live matches page")

      HtmlUnit("/football/live") { browser =>

        import browser._

        then("I should see fixtures for today")

        val today = new DateMidnight().toString("EEEE dd MMMM yyyy")
        $(".competitions-date").getTexts should contain(today)

        val fixture = findFirst(".live-match")
        fixture.findFirst(".home").getText should be("Chester FC")
        fixture.findFirst(".away").getText should be("FC Halifax")
        findFirst(".status").getText should include("FT")
      }
    }
  }
}
