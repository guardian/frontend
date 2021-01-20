package model

import org.scalatest.{DoNotDiscover, Matchers, GivenWhenThen, FeatureSpec}
import test.ConfiguredTestSuite

@DoNotDiscover class TopStoriesFeatureTest
    extends FeatureSpec
    with GivenWhenThen
    with Matchers
    with ConfiguredTestSuite {

  feature("Latest top stories") {

    scenario("Shows latest links when on a page in the UK edition") {

      Given("I am on any page in the UK edition")
      goTo("/top-stories") { browser =>
        import browser._

        Then("I should see the top stories for the UK edition")
        And("there should be 10 links")
        $("li").size should be > 1

      }
    }

    scenario("Shows latest links for a section in US edition") {
      Given("I am on any page in the US edition")
      US("/top-stories") { browser =>
        import browser._

        Then("I should see the top stories for the US edition")
        And("there should be 10 links")
        $("li").size should be > 1
      }
    }
  }
}
