package test

import org.scalatest._
import play.api.test.TestBrowser
import org.scalatest.featurespec.AnyFeatureSpec
import org.scalatest.matchers.should.Matchers

@DoNotDiscover class FaciaFeatureTest extends AnyFeatureSpec with GivenWhenThen with Matchers with ConfiguredTestSuite {

  Feature("Facia") {

    Feature("Sponsorships") {

      def testFrontSponsorship(browser: TestBrowser, sponsorshipType: String): Assertion = {
        import browser._

        Then("the page should be styled differently")
        $(s".facia-container--$sponsorshipType").size should be(1)

        And(s"the ${sponsorshipType.replace("-", " ")} badge should be displayed")
        $(".js-sponsored-front") should have size 1
        $(s".facia-container--$sponsorshipType").attributes("data-sponsorship").toString should be(sponsorshipType)
      }

      def testContainerSponsorship(
          browser: TestBrowser,
          sponsorshipType: String,
          sponsoredContainerIndex: Int,
      ): Assertion = {
        import browser._

        val sponsoredContainer = $(".container").get(sponsoredContainerIndex)

        Then("the container should be styled differently")
        // second container is sponsored
        sponsoredContainer.attribute("class").split(" ") should contain(s"container--$sponsorshipType")

        And(s"the ${sponsorshipType.replace("-", " ")} badge should be displayed")
        sponsoredContainer.attribute("class").split(" ") should contain("js-sponsored-front")
        sponsoredContainer.attribute("data-sponsorship") should be(sponsorshipType)
      }

      /**
        * NOTE - these tests run off real sponsored data which might not be reliable
        *
       * If a test fails, i.e. because a sponsorship expires, see
        * https://frontend.gutools.co.uk/analytics/commercial/sponsorships for a different sponsorship to use
        *
       * If they fail often, might need to look into setting up a reliable data source
        */
      Scenario("Advertisement Feature Front") {

        Given("I am on an advertisement feature front")
        goTo("/sustainable-business/hm-partner-zone") { browser =>
          testFrontSponsorship(browser, "advertisement-feature")
        }

      }

      Scenario("Advertisement Feature Container") {

        Given("I am on a front with an advertisement feature container")
        goTo("/lifeandstyle/live-better") { browser =>
          testContainerSponsorship(browser, "sponsored", 2)
        }

      }

      Scenario("Sponsored Front") {

        Given("I am on a sponsored front")
        goTo("/lifeandstyle/live-better") { browser =>
          testFrontSponsorship(browser, "sponsored")
        }

      }

      Scenario("Sponsored Container") {

        Given("I am on a front with a sponsored container")
        goTo("/lifeandstyle/live-better") { browser =>
          testContainerSponsorship(browser, "sponsored", 1)
        }

      }

      Scenario("Foundation Supported Front") {

        Given("I am on a foundation supported front")
        goTo("/global-development") { browser =>
          testFrontSponsorship(browser, "foundation-supported")
        }

      }

      Scenario("Foundation Supported Container") {

        Given("I am on a front with a foundation supported container")
        goTo("/global-development") { browser =>
          testContainerSponsorship(browser, "foundation-supported", 1)
        }

      }

    }

  }
}
