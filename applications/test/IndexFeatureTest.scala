package test

import play.api.test.TestBrowser
import org.scalatest._

@DoNotDiscover class IndexFeatureTest extends FeatureSpec with GivenWhenThen with Matchers with ConfiguredTestSuite {

  feature("Section") {

    feature("Sponsorships") {

      def testFrontSponsorship(browser: TestBrowser, sponsorshipType: String): Assertion = {
        import browser._

        Then("the page should be styled differently")
        $(s".facia-container--$sponsorshipType").size should be(1)

        And(s"the ${sponsorshipType.replace("-", " ")} badge should be displayed")
        $(".js-sponsored-front") should have size 1
        $(s".facia-container--$sponsorshipType").attribute("data-sponsorship") should be(sponsorshipType)
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
        goTo("/visa-partner-zone") { browser =>
          testFrontSponsorship(browser, "advertisement-feature");
        }

      }

      scenario("Sponsored Front") {

        Given("I am on ansponsored front")
        goTo("/sustainable-business/role-business-development") { browser =>
          testFrontSponsorship(browser, "sponsored");
        }

      }

      scenario("Foundation Supported Front") {

        Given("I am on a foundation supported front")
        goTo("/global-development") { browser =>
          testFrontSponsorship(browser, "foundation-supported");
        }

      }

    }

  }
}
