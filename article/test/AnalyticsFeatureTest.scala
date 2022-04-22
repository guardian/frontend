package test

import org.scalatest.{DoNotDiscover, GivenWhenThen}

import collection.JavaConverters._
import org.fluentlenium.core.domain.FluentWebElement
import conf.Configuration
import org.scalatest.featurespec.AnyFeatureSpec
import org.scalatest.matchers.should.Matchers

@DoNotDiscover class AnalyticsFeatureTest
    extends AnyFeatureSpec
    with GivenWhenThen
    with Matchers
    with ConfiguredTestSuite {
  implicit val config = Configuration

  Feature("Analytics") {

    conf.switches.Switches.EnableDiscussionSwitch.switchOff()
    // Feature

    info("In order understand how people are using the website and provide data for auditing")
    info("As a product manager")
    info("I want record usage metrics")

    // Scenarios

    Scenario("Ensure all clicked links are recorded by Analytics") {
      Given("I am on an article entitled 'Olympic opening ceremony will recreate countryside with real animals'")
      goTo("/sport/2012/jun/12/london-2012-olympic-opening-ceremony") { browser =>
        Then("all links on the page should be decorated with the Omniture meta-data attribute")
        val anchorsWithNoDataLink = browser.find("a").asScala.filter(hasNoLinkName)
        anchorsWithNoDataLink should have length 0
      }

    }

    Scenario("Ophan tracks user actions")(pending)

  }

  private def hasNoLinkName(e: FluentWebElement) = e.attribute("data-link-name") == null

}
