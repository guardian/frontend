package test

import org.scalatest.{ FeatureSpec, GivenWhenThen }
import org.scalatest.matchers.ShouldMatchers
import collection.JavaConversions._
import org.joda.time.DateTime

class FixturesFeatureTest extends FeatureSpec with GivenWhenThen with ShouldMatchers {

  feature("Football Fixtures") {

    scenario("Visit the fixtures page") {

      Given("I visit the fixtures page")

      //the url /football/fixtures is based on the current day
      //this just checks it loads
      HtmlUnit("/football/fixtures") { browser =>
        import browser._
        findFirst("h1").getText should be("All fixtures")
      }

      //A dated url will give us a fixed set of fixtures we can assert against
      HtmlUnit("/football/fixtures/2012/oct/20") { browser =>
        import browser._

        Then("I should see fixtures for today")

        findFirst(".competitions-date").getText should be("Sunday 21 October 2012")

        val fixture = $(".matches").findFirst(".match-desc")
        fixture.findFirst(".match-home").getText should be("Sunderland")
        fixture.findFirst(".match-away").getText should be("Newcastle")
        findFirst(".match-status").getText should include("13:30")

        And("I should see fixtures for tomorrow")
        $(".competitions-date").getTexts should contain("Sunday 21 October 2012")

        And("I should see fixtures for the next day")
        $(".competitions-date").getTexts should contain("Tuesday 23 October 2012")
      }
    }

    scenario("Next fixtures") {
      Given("I am on the fixtures page")
      HtmlUnit("/football/fixtures/2012/oct/20") { browser =>
        import browser._

        When("I should see a link to the next fixtures")

        findFirst("[data-link-name=next]").getAttribute("href") should endWith("/football/fixtures/2012/oct/24")

      }
    }

    scenario("Link tracking") {
      Given("I visit the fixtures page")
      HtmlUnit("/football/fixtures/2012/oct/20") { browser =>
        import browser._
        Then("any links I click should be tracked")
        $("a").filter(link => !Option(link.getAttribute("data-link-name")).isDefined).foreach { link =>
          fail(s"Link with text ${link.getText} has no data-link-name")
        }
      }
    }

    scenario("The 'Desktop version' link points to the correct, equivalent desktop page") {

      Given("I visit the fixtures page")
      And("I am on the 'UK' edition")
      HtmlUnit("/football/fixtures") { browser =>
        import browser._

        Then("the 'Desktop version' link should point to 'http://www.guardian.co.uk/football/matches?mobile-redirect=false'")
        findFirst("#main-site").getAttribute("href") should be("http://www.guardian.co.uk/football/matches?mobile-redirect=false")
      }

      Given("I visit the fixtures page")
      And("I am on the 'US' edition")
      HtmlUnit.US("/football/fixtures") { browser =>
        import browser._

        Then("the 'Desktop version' link should point to 'http://www.guardiannews.com/football/matches?mobile-redirect=false'")
        findFirst("#main-site").getAttribute("href") should be("http://www.guardiannews.com/football/matches?mobile-redirect=false")
      }

    }

  }
}