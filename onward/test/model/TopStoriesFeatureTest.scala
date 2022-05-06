package model

import org.scalatest.featurespec.AnyFeatureSpec
import org.scalatest.matchers.should.Matchers
import org.scalatest.{DoNotDiscover, GivenWhenThen}
import test.ConfiguredTestSuite

@DoNotDiscover class TopStoriesFeatureTest
    extends AnyFeatureSpec
    with GivenWhenThen
    with Matchers
    with ConfiguredTestSuite {

  Feature("Latest top stories") {

    Scenario("Shows latest links when on a page in the UK edition") {

      Given("I am on any page in the UK edition")
      goTo("/top-stories") { browser =>
        import browser._

        Then("I should see the top stories for the UK edition")
        And("there should be 10 links")
        $("li").size should be > 1

      }
    }

    Scenario("Shows latest links for a section in US edition") {
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
