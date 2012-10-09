package test

import org.scalatest.{ FeatureSpec, GivenWhenThen }
import org.scalatest.matchers.ShouldMatchers
import collection.JavaConversions._

class ResultsFeatureTest extends FeatureSpec with GivenWhenThen with ShouldMatchers {

  feature("Football Results") {

    scenario("Visit the results page") {

      given("I visit the results page")

      //the url /football/results is based on the current day
      //this just checks it loads
      HtmlUnit("/football/results") { browser =>
        import browser._
        findFirst("h1").getText should be("All results")
      }

      //A dated url will give us a fixed set of results we can assert against
      HtmlUnit("/football/results/2012/sep/02") { browser =>
        import browser._
        then("I should see results for today")

        findFirst(".competitions-date").getText should be("Sunday 2 September 2012")

        val fixture = findFirst(".matches").findFirst(".match-desc")
        fixture.findFirst(".home").getText should be("Liverpool")
        fixture.findFirst(".away").getText should be("Arsenal")
        findFirst(".status").getText should include("FT")

        and("I should see results for yesterday")
        $(".competitions-date").getTexts should contain("Saturday 1 September 2012")

        and("I should see results for the previous before")
        $(".competitions-date").getTexts should contain("Sunday 26 August 2012")
      }
    }

    scenario("Next results") {
      given("I am on the results page")
      HtmlUnit("/football/results/2012/sep/02") { browser =>
        import browser._
        when("I click the 'next' link")
        findFirst("[data-link-name=previous]").click()
        browser.await()

        then("I should navigate to the next set of results")
        findFirst(".competitions-date").getText should be("Saturday 25 August 2012")
      }
    }

    scenario("Link tracking") {
      given("I visit the results page")
      HtmlUnit("/football/results/2012/oct/13") { browser =>
        import browser._
        then("any links I click should be tracked")
        $("a").filter(link => !Option(link.getAttribute("data-link-name")).isDefined).foreach { link =>
          fail("Link with text %s has no data-link-name".format(link.getText))
        }
      }
    }
  }
}
