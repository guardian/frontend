package test

import org.scalatest.{ FeatureSpec, GivenWhenThen }
import org.scalatest.matchers.ShouldMatchers
import collection.JavaConversions._

class ResultsFeatureTest extends FeatureSpec with GivenWhenThen with ShouldMatchers {

  feature("Football Results") {

    scenario("Visit the results page") {

      Given("I visit the results page")

      //the url /football/results is based on the current day
      //this just checks it loads
      HtmlUnit("/football/results") { browser =>
        import browser._
        findFirst("h1").getText should be("All results")
      }

      //A dated url will give us a fixed set of results we can assert against
      HtmlUnit("/football/results/2012/oct/20") { browser =>
        import browser._

        Then("I should see results for today")

        findFirst(".competitions-date").getText should be("Friday 19 October 2012")

        val results = $(".matches").findFirst(".match-desc")
        results.findFirst(".match-home").getText should be("Sheff Wed")
        results.findFirst(".match-away").getText should be("Leeds")
        findFirst(".match-status").getText should include("FT")

        And("I should see results for previous days")
        $(".competitions-date").getTexts should contain("Friday 19 October 2012")
        $(".competitions-date").getTexts should contain("Saturday 6 October 2012")
      }
    }

    scenario("Next results") {
      Given("I am on the results page")
      HtmlUnit("/football/results/2012/oct/20") { browser =>
        import browser._

        Then("I should see the 'previous'")

        findFirst("[data-link-name=previous]").getAttribute("href") should endWith("/football/results/2012/oct/03")
      }
    }

    scenario("Competition results filter") {

      Given("I am on the the results page")
      HtmlUnit("/football/results/2012/oct/20") { browser =>
        import browser._

        When("I click the filter to premier league link")

        findFirst("[data-link-name='Premier League']").click()
        browser.await()

        Then("I should navigate to the premier league results page")
        find(".match-desc").map(_.getText) should contain("Spurs 2-4 Chelsea")
      }
    }

    scenario("Link tracking") {
      Given("I visit the results page")
      HtmlUnit("/football/results/2012/oct/20") { browser =>
        import browser._
        Then("any links I click should be tracked")
        $("a").filter(link => !Option(link.getAttribute("data-link-name")).isDefined).foreach { link =>
          fail(s"Link with text ${link.getText} has no data-link-name")
        }
      }
    }

    scenario("The 'Desktop version' link points to the correct, equivalent desktop page") {

      Given("I visit the results page")
      And("I am on the 'UK' edition")
      HtmlUnit("/football/results") { browser =>
        import browser._

        Then("the 'Desktop version' link should point to 'http://www.guardian.co.uk/football/matches?mobile-redirect=false'")
        findFirst("#main-site").getAttribute("href") should be("http://www.guardian.co.uk/football/matches?mobile-redirect=false")
      }

      Given("I visit the results page")
      And("I am on the 'US' edition")
      HtmlUnit.US("/football/results") { browser =>
        import browser._

        Then("the 'Desktop version' link should point to 'http://www.guardiannews.com/football/matches?mobile-redirect=false'")
        findFirst("#main-site").getAttribute("href") should be("http://www.guardiannews.com/football/matches?mobile-redirect=false")
      }

    }
  }
}
