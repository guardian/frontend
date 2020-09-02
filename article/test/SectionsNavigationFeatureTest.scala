package test

import org.scalatest.{DoNotDiscover, Matchers, GivenWhenThen, FeatureSpec}
import collection.JavaConverters._
import org.fluentlenium.core.filter.FilterConstructor._

import conf.Configuration

@DoNotDiscover class SectionsNavigationFeatureTest
    extends FeatureSpec
    with GivenWhenThen
    with Matchers
    with ConfiguredTestSuite {

  implicit val config = Configuration

  feature("Section Navigation") {

    scenario("Link to US edition", ArticleComponents) {
      Given("I am on any guardian.co.uk page")
      goTo("/world/2012/aug/23/australia-mining-boom-end") { browser =>
        Then("I should see a link to the US edition")

        val editionLink = browser.el("[data-link-name='nav2 : topbar : edition-picker: US']")

        editionLink.attribute("href") should be(s"http://localhost:${port}/preference/edition/us")
      }
    }

    scenario("Link to UK edition", ArticleComponents) {
      Given("I am on any guardiannews.com page")
      US("/world/2012/aug/23/australia-mining-boom-end") { browser =>
        Then("I should see a link to the UK edition")

        val editionLink = browser.el("[data-link-name='nav2 : topbar : edition-picker: UK']")

        editionLink.attribute("href") should be(s"http://localhost:${port}/preference/edition/uk")
      }
    }

    scenario("Links to company information", ArticleComponents) {
      Given("I am on any guardian.co.uk page")
      US("/world/2012/aug/23/australia-mining-boom-end") { browser =>
        Then("I should see a link to the contributors section!!")
        val contributors = browser.find("[data-link-name='us : footer : all contributors']")
        contributors.asScala.length should be > 0

        And("a link to the contact us page")
        val contact = browser.find("[data-link-name='us : footer : contact us']")
        contact.asScala.length should be > 0

        And("a link to the about us page")
        val info = browser.find("[data-link-name='us : footer : about us']")
        info.asScala.length should be > 0

        And("a link to the complaints and corrections")
        val complaints = browser.find("[data-link-name='complaints']")
        complaints.asScala.length should be > 0
      }
    }

    scenario("Links to legal information", ArticleComponents) {
      Given("I am on any guardian.co.uk page")
      US("/world/2012/aug/23/australia-mining-boom-end") { browser =>
        Then("I should see a link to the terms & Conditions in the page footer")

        val terms = browser.find("[data-link-name='terms']")
        terms.asScala.length should be > 0

        And("a link to the privacy policy page")
        val privacy = browser.find("[data-link-name='privacy']")
        privacy.asScala.length should be > 0
      }
    }
  }
}
