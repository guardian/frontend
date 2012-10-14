package test

import org.scalatest.{ FeatureSpec, GivenWhenThen }
import org.scalatest.matchers.ShouldMatchers
import collection.JavaConversions._

class CompetitionsFixturesFeatureTest extends FeatureSpec with GivenWhenThen with ShouldMatchers {

  feature("Football Fixtures") {

    ignore("Visit the fixtures page") {

      given("I visit the fixtures page")

      //the url /football/fixtures is based on the current day
      //this just checks it loads
      HtmlUnit("/football/premierleague/fixtures") { browser =>
        import browser._
        findFirst("h1").getText should be("All fixtures")
      }

      //A dated url will give us a fixed set of fixtures we can assert against
      HtmlUnit("/football/premierleague/fixtures/2012/oct/13") { browser =>
        import browser._
        then("I should see fixtures for today")

        findFirst(".competitions-date").getText should be("Saturday 20 October 2012")

        val fixture = findFirst(".matches").findFirst(".match-desc")
        fixture.findFirst(".home").getText should be("Tottenham")
        fixture.findFirst(".away").getText should be("Chelsea")
        findFirst(".status").getText should include("12:45")

        and("I should see fixtures for the future")
        $(".competitions-date").getTexts should contain("Saturday 27 October 2012")
        $(".competitions-date").getTexts should contain("Tuesday 27 November 2012")
      }
    }

    ignore("Next fixtures") {
      given("I am on the fixtures page")
      //A dated url will give us a fixed set of fixtures we can assert against
      HtmlUnit("/football/premierleague/fixtures/2012/oct/13") { browser =>
        import browser._
        when("I click the 'next' link")

        findFirst("[data-link-name=next]").click()
        browser.await()

        then("I should navigate to the next set of fixtures")
        findFirst(".competitions-date").getText should be("Saturday 22 December 2012")
      }
    }

    ignore("Link tracking") {
      given("I visit the fixtures page")
      HtmlUnit("/football/premierleague/fixtures/2012/oct/13") { browser =>
        import browser._
        then("any links I click should be tracked")
        $("a").filter(link => !Option(link.getAttribute("data-link-name")).isDefined).foreach { link =>
          fail("Link with text %s has no data-link-name".format(link.getText))
        }
      }
    }
  }
}
