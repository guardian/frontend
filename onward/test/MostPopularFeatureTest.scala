package test

import org.scalatest.{DoNotDiscover, Matchers, GivenWhenThen, FeatureSpec}
import scala.collection.JavaConversions._

@DoNotDiscover class MostPopularFeatureTest extends FeatureSpec with GivenWhenThen with Matchers with ConfiguredTestSuite {

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
      goTo("/most-read/world") { browser =>
        import browser._
        Then("I should see a list of 'world' content")
        findFirst(".zone-world").findFirst("h2").getText should be("Most popular in world news")
        And("it should contain world news")
        $(".zone-world li").size should be > (0)

      }
    }
  }
}
