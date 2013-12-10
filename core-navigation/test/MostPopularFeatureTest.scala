package test

import org.scalatest.Matchers
import org.scalatest.{ GivenWhenThen, FeatureSpec }
import scala.collection.JavaConversions._
import conf.Switches

class MostPopularFeatureTest extends FeatureSpec with GivenWhenThen with Matchers {

  feature("Most popular") {

    // Feature

    info("In order to explore the most popular Guardian stories")
    info("As a Guardian Reader")
    info("I want to read the most read stories across the guardian and within the section I'm in")

    // Metrics

    info("Interactions on the Most read area at the bottom of the page should be +2% of overall page views")

    // Scenarios

    scenario("Most popular for a section") {

      Given("I am on a page in the 'World' section")
      HtmlUnit("/most-read/world") { browser =>
        import browser._

        Then("I should see a list of 'world' content")
        findFirst(".zone-world").findFirst("h2").getText should be("Most read: World news")
        And("it should contain world news")
        $(".zone-world li").size should be > (0)

      }
    }

    scenario("Viewing site-wide most popular") {

      Given("I am on a page in the 'World' section")
      HtmlUnit("/most-read/world") { browser =>
        import browser._

        Then("I should see the site wide most read")
        $("main h2")(1).getText should be("Most read: The Guardian")
      }
    }
  }
}
