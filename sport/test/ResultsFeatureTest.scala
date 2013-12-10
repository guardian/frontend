package test

import org.scalatest.{ FeatureSpec, GivenWhenThen }
import org.scalatest.Matchers
import collection.JavaConversions._

class ResultsFeatureTest extends FeatureSpec with GivenWhenThen with Matchers {

  feature("Football Results") {

    scenario("Visit the results page") {

      Given("I visit the results page")

      HtmlUnit("/football/results") { browser =>
        import browser._

        Then("I should see todays live matches")
        val matches = $(".match-desc").getTexts
        matches should contain ("Arsenal 1-0 Spurs")

        And("I should see results for previous days")
        matches should contain ("Sunderland 1-1 West Ham")
        matches should contain ("Wigan 1-1 Everton")
        matches should contain ("Chelsea 0-0 Man U")
        matches should contain ("Fulham 0-0 Norwich")
      }
    }

    scenario("Next results") {
      Given("I am on the results page")
      HtmlUnit("/football/results") { browser =>
        import browser._

        And("I click the 'previous' results link")
        findFirst("[data-link-name=previous]").click()

        Then("I should see earlier results")
        $(".match-desc").getTexts should contain ("Stoke 1-1 Villa")
      }
    }

    scenario("Competition results filter") {

      Given("I am on the the results page")
      HtmlUnit("/football/results") { browser =>
        import browser._

        When("I click the filter to premier league link")

        findFirst("[data-link-name='Premier League']").click()
        browser.await()

        Then("I should navigate to the premier league results page")
        $(".match-desc").getTexts should contain("Arsenal 1-0 Spurs")

        And("I should not see other leagues results")
        $(".match-desc").getTexts should not contain("Bolton 1-1 Derby")
      }
    }

    scenario("Link tracking") {
      Given("I visit the results page")
      HtmlUnit("/football/results") { browser =>
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

        Then("the 'Desktop version' link should point to '/football/results?view=desktop'")
        findFirst(".js-main-site-link").getAttribute("href") should be(DesktopVersionLink("/football/results"))
      }

      Given("I visit the results page")
      And("I am on the 'US' edition")
      HtmlUnit.US("/football/results") { browser =>
        import browser._

        Then("the 'Desktop version' link should point to '/football/results?view=desktop'")
        findFirst(".js-main-site-link").getAttribute("href") should be(DesktopVersionLink("/football/results"))
      }

    }
  }
}
