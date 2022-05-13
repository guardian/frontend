package test

import org.scalatest.featurespec.AnyFeatureSpec
import org.scalatest.matchers.should.Matchers

import org.scalatest.{DoNotDiscover, GivenWhenThen}

@DoNotDiscover class MostPopularFeatureTest
    extends AnyFeatureSpec
    with GivenWhenThen
    with Matchers
    with ConfiguredTestSuite {

  Feature("Most popular") {

    // Feature

    info("In order to explore the most popular Guardian stories")
    info("As a Guardian Reader")
    info("I want to read the most read stories across the guardian and within the section I'm in")

    // Metrics

    info("Interactions on the Most read area at the bottom of the page should be +2% of overall page views")

    // Scenarios

    Scenario("Most popular for a section") {

      Given("I am on a page in the 'World' section")
      goTo("/most-read/world") { browser =>
        import browser._
        Then("I should see a list of 'world' content")
        $(".zone-world").$("h2").first().text() should be("Most viewed in World news")
        And("it should contain world news")
        $(".zone-world li").size should be > 0
      }

      Given("I am on a page in the 'US news' section")
      goTo("/most-read/us-news") { browser =>
        import browser._
        Then("I should see a list of 'US news' content, with the heading correctly capitalized")
        $(".zone-us-news").$("h2").first().text() should be("Most viewed in US news")
        And("it should contain US news")
        $(".zone-us-news li").size should be > 0

      }
    }
  }
}
