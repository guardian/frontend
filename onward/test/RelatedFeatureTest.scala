package test

import org.scalatest.featurespec.AnyFeatureSpec
import org.scalatest.matchers.should.Matchers
import org.scalatest.{DoNotDiscover, GivenWhenThen}

@DoNotDiscover class RelatedFeatureTest
    extends AnyFeatureSpec
    with GivenWhenThen
    with Matchers
    with ConfiguredTestSuite {

  Feature("Related links") {

    // Feature

    info("In order to continue reading more about the story")
    info("As a Guardian reader")
    info("I want to visit related links to the current article I am reading")

    // Metrics

    info("Increase average number of articles 'read' from 1.9% to 2.5%")

    // Features

    Scenario("Shows related links for each article") {

      Given("there is an article 'Woman tortured during burglary tells of waterboarding ordeal'")
      goTo("/related/uk/2012/aug/07/woman-torture-burglary-waterboard-surrey") { browser =>
        import browser._
        Then("I should see the related links")
        $("[itemprop=mainContentOfPage]").find("li") should have length 8
      }
    }
  }
}
