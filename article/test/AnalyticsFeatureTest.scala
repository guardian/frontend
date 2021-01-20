package test

import org.scalatest.{DoNotDiscover, Matchers, GivenWhenThen, FeatureSpec}
import collection.JavaConverters._
import org.fluentlenium.core.domain.FluentWebElement
import conf.Configuration

@DoNotDiscover class AnalyticsFeatureTest
    extends FeatureSpec
    with GivenWhenThen
    with Matchers
    with ConfiguredTestSuite {
  implicit val config = Configuration

  feature("Analytics") {

    conf.switches.Switches.EnableDiscussionSwitch.switchOff()
    // Feature

    info("In order understand how people are using the website and provide data for auditing")
    info("As a product manager")
    info("I want record usage metrics")

    // Scenarios

    scenario("Ensure all clicked links are recorded by Analytics") {
      Given("I am on an article entitled 'Olympic opening ceremony will recreate countryside with real animals'")
      goTo("/sport/2012/jun/12/london-2012-olympic-opening-ceremony") { browser =>
        Then("all links on the page should be decorated with the Omniture meta-data attribute")
        val anchorsWithNoDataLink = browser.find("a").asScala.filter(hasNoLinkName)
        anchorsWithNoDataLink should have length 0
      }

    }

    scenario("Ophan tracks user actions")(pending)

  }

  private def hasNoLinkName(e: FluentWebElement) = e.attribute("data-link-name") == null

}
