package test

import org.scalatest.{ FeatureSpec, GivenWhenThen }
import org.scalatest.matchers.ShouldMatchers

class FixturesFeatureTest extends FeatureSpec with GivenWhenThen with ShouldMatchers {

  feature("Football Fixtures") {

    scenario("Visit the fixtures page") {

      given("I visit the fixtures page")

      //the url /football/fixtures is based on the current day
      //this just checks it loads
      HtmlUnit("/football/fixtures") { browser =>
        import browser._
        findFirst("h1").getText should be("All fixtures")
      }

      //A dated url will give us a fixed set of fixtures we can assert against
      HtmlUnit("/football/fixtures/2012/oct/13") { browser =>
        import browser._

        then("I should see fixtures for today")

        findFirst(".competitions-date").getText should be("Saturday 13 October 2012")

        val fixture = findFirst(".fixtures").findFirst(".fixture-desc")
        fixture.findFirst(".home").getText should be("Bournemouth")
        fixture.findFirst(".away").getText should be("Leyton Orient")
        findFirst(".status").getText should include("15:00")

        and("I should see fixtures for tomorrow")
        $(".competitions-date").getTexts should contain("Sunday 14 October 2012")

        and("I should see fixtures for the next day")
        $(".competitions-date").getTexts should contain("Monday 15 October 2012")
      }
    }

    scenario("Next fixtures") {
      given("I am on the fixtures page")
      //A dated url will give us a fixed set of fixtures we can assert against
      HtmlUnit("/football/fixtures/2012/oct/13") { browser =>
        import browser._

        when("I click the 'next' link")
        findFirst("[data-link-name='next fixtures']").click()
        browser.await()

        then("I should navigate to the next set of fixtures")
        findFirst(".competitions-date").getText should be("Tuesday 16 October 2012")
      }
    }
  }
}
