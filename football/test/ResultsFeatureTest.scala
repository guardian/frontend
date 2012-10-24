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
      HtmlUnit("/football/results/2012/oct/20") { browser =>
        import browser._

        then("I should see results for today")

        findFirst(".competitions-date").getText should be("Friday 19 October 2012")

        val results = $(".matches").findFirst(".match-desc")
        results.findFirst(".home").getText should be("Sheff Wed")
        results.findFirst(".away").getText should be("Leeds")
        findFirst(".status").getText should include("FT")

        and("I should see results for previous days")
        $(".competitions-date").getTexts should contain("Wednesday 17 October 2012")
        $(".competitions-date").getTexts should contain("Tuesday 16 October 2012")
      }
    }

    scenario("Next results") {
      given("I am on the results page")
      HtmlUnit("/football/results/2012/oct/20") { browser =>
        import browser._

        when("I click the 'previous' link")

        findFirst("[data-link-name=previous]").click()
        browser.await()

        then("I should navigate to the previous set of results")
        findFirst(".competitions-date").getText should be("Monday 15 October 2012")
      }
    }

    scenario("Competition results filter") {

      given("I am on the the results page")
      HtmlUnit("/football/results/2012/oct/20") { browser =>
        import browser._

        when("I click the filter to premier league link")

        findFirst("[data-link-name='Premier League']").click()
        browser.await()

        then("I should navigate to the premier league results page")
        findFirst(".competitions-date").getText should be("Wednesday 24 October 2012")
        find(".match-desc").map(_.getText) should contain("Tottenham 2-4 Chelsea")
      }
    }

    scenario("Link tracking") {
      given("I visit the results page")
      HtmlUnit("/football/results/2012/oct/20") { browser =>
        import browser._
        then("any links I click should be tracked")
        $("a").filter(link => !Option(link.getAttribute("data-link-name")).isDefined).foreach { link =>
          fail("Link with text %s has no data-link-name".format(link.getText))
        }
      }
    }
  }
}
