package test

import org.scalatest.{ FeatureSpec, GivenWhenThen }
import org.scalatest.matchers.ShouldMatchers
import collection.JavaConversions._
import org.joda.time.DateTime

class FixturesFeatureTest extends FeatureSpec with GivenWhenThen with ShouldMatchers {

  feature("Football Fixtures") {

    scenario("Visit the fixtures page") {

      Given("I visit the fixtures page")

      HtmlUnit("/football/fixtures") { browser =>
        import browser._
        findFirst("h1").getText should be("All fixtures")

        Then("I should see todays live matches")
        val matches = $(".match-desc").getTexts
        matches should contain ("Arsenal 1-0 Spurs")

        And("The next 3 days fixtures")
        matches should contain("Liverpool v Man C")
        matches should contain("Wigan v Fulham")
        matches should contain("Stoke v Everton")
      }
    }

    scenario("Next fixtures") {
      Given("I am on the fixtures page")
      HtmlUnit("/football/fixtures") { browser =>
        import browser._

        When("I click the 'Next' fixtures link")

        findFirst("[data-link-name=next]").click()

        Then("I should see the next set of upcoming matches")
        $(".match-desc").getTexts should contain ("Swansea v Reading")

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

        Then("the 'Desktop version' link should point to '/football/fixtures?view=desktop'")
        findFirst(".js-main-site-link").getAttribute("href") should be("http://localhost:9000/football/fixtures?view=desktop")
      }

      Given("I visit the fixtures page")
      And("I am on the 'US' edition")
      HtmlUnit.US("/football/fixtures") { browser =>
        import browser._

        Then("the 'Desktop version' link should point to '/football/fixtures?view=desktop'")
        findFirst(".js-main-site-link").getAttribute("href") should be("http://localhost:9000/football/fixtures?view=desktop")
      }

    }

  }
}