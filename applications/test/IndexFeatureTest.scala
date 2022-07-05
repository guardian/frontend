package test

import play.api.test.TestBrowser
import org.scalatest._
import org.scalatest.featurespec.AnyFeatureSpec
import org.scalatest.matchers.should.Matchers

import scala.jdk.CollectionConverters._

@DoNotDiscover class IndexFeatureTest extends AnyFeatureSpec with GivenWhenThen with Matchers with ConfiguredTestSuite {

  Feature("Section") {

    Feature("Sponsorships") {

      def testFrontSponsorship(browser: TestBrowser, sponsorshipType: String): Assertion = {
        import browser._

        Then("the page should be styled differently")
        $(s".facia-container--$sponsorshipType").size should be(1)

        And(s"the ${sponsorshipType.replace("-", " ")} badge should be displayed")
        $(".js-sponsored-front") should have size 1
        $(s".facia-container--$sponsorshipType").attributes("data-sponsorship").asScala.toList.head should be(
          sponsorshipType,
        )
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
        goTo("/visa-partner-zone") { browser =>
          testFrontSponsorship(browser, "advertisement-feature");
        }

      }

      Scenario("Sponsored Front") {

        Given("I am on ansponsored front")
        goTo("/sustainable-business/role-business-development") { browser =>
          testFrontSponsorship(browser, "sponsored");
        }

      }

      Scenario("Foundation Supported Front") {

        Given("I am on a foundation supported front")
        goTo("/global-development") { browser =>
          testFrontSponsorship(browser, "foundation-supported");
        }

      }

    }

  }
}
