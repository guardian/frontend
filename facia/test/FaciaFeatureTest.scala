package test

import org.scalatest._
import play.api.test.TestBrowser
import org.fluentlenium.core.domain.FluentWebElement

@DoNotDiscover class FaciaFeatureTest extends FeatureSpec with GivenWhenThen with Matchers with ConfiguredTestSuite {

  feature("Facia") {

    feature("Sponsorships") {

      def testFrontSponsorship(browser: TestBrowser, sponsorshipType: String): Assertion = {
        import browser._

        Then("the page should be styled differently")
        $(s".facia-container--$sponsorshipType").size should be(1)

        And(s"the ${sponsorshipType.replace("-", " ")} badge should be displayed")
        $(".js-sponsored-front") should have size 1
        $(s".facia-container--$sponsorshipType").attribute("data-sponsorship") should be(sponsorshipType)
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
      scenario("Advertisement Feature Front") {

        Given("I am on an advertisement feature front")
        goTo("/sustainable-business/hm-partner-zone") { browser =>
          testFrontSponsorship(browser, "advertisement-feature")
        }

      }

      scenario("Advertisement Feature Container") {

        Given("I am on a front with an advertisement feature container")
        goTo("/lifeandstyle/live-better") { browser =>
          testContainerSponsorship(browser, "sponsored", 2)
        }

      }

      scenario("Sponsored Front") {

        Given("I am on a sponsored front")
        goTo("/lifeandstyle/live-better") { browser =>
          testFrontSponsorship(browser, "sponsored")
        }

      }

      scenario("Sponsored Container") {

        Given("I am on a front with a sponsored container")
        goTo("/lifeandstyle/live-better") { browser =>
          testContainerSponsorship(browser, "sponsored", 1)
        }

      }

      scenario("Foundation Supported Front") {

        Given("I am on a foundation supported front")
        goTo("/global-development") { browser =>
          testFrontSponsorship(browser, "foundation-supported")
        }

      }

      scenario("Foundation Supported Container") {

        Given("I am on a front with a foundation supported container")
        goTo("/global-development") { browser =>
          testContainerSponsorship(browser, "foundation-supported", 1)
        }

      }

    }

  }
}
