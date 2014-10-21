package test

import org.scalatest.{DoNotDiscover, Matchers, GivenWhenThen, FeatureSpec}

@DoNotDiscover class IndexFeatureTest extends FeatureSpec with GivenWhenThen with Matchers with ConfiguredTestSuite {

  feature("Section") {

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
        import browser._

        Then("the page should be styled differently")
        $(".facia-container--advertisement-feature").size should be (1)

        And("the advertisement feature badge should be displayed")
        $(".js-sponsored-front") should have size (1)
        $(".facia-container--advertisement-feature").getAttribute("data-sponsorship") should be ("advertisement-feature")
      }

    }

    scenario("Sponsored Front") {

      Given("I am on ansponsored front")
      goTo("/sustainable-business/role-business-development") { browser =>
        import browser._

        Then("the page should be have a unique class")
        $(".facia-container--sponsored").size should be (1)

        And("the sponsored badge should be displayed")
        $(".js-sponsored-front") should have size (1)
        $(".facia-container--sponsored").getAttribute("data-sponsorship") should be ("sponsored")
      }

    }

    scenario("Foundation Supported Front") {

      Given("I am on a foundation supported front")
      goTo("/global-development") { browser =>
        import browser._

        Then("the page should be have a unique class")
        $(".facia-container--foundation-supported").size should be (1)

        And("the sponsored badge should be displayed")
        $(".js-sponsored-front") should have size (1)
        $(".facia-container--foundation-supported").getAttribute("data-sponsorship") should be ("foundation-supported")
      }

    }

  }
}
