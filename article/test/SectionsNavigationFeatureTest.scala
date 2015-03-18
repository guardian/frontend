package test

import org.scalatest.{DoNotDiscover, Matchers, GivenWhenThen, FeatureSpec}
import collection.JavaConversions._
import org.fluentlenium.core.filter.FilterConstructor._

import conf.Configuration

@DoNotDiscover class SectionsNavigationFeatureTest extends FeatureSpec with GivenWhenThen with Matchers with ConfiguredTestSuite {

  implicit val config = Configuration

  feature("Section Navigation") {

    scenario("Links to sections", ArticleComponents) {

      Given("I am on any guardian.co.uk page")
      goTo("/world/2012/aug/23/australia-mining-boom-end") { browser =>

        Then("I should see a list of top sections")

        val sections = browser.find("#footer-nav li a")

        sections.length should be > 0

        And("a button to activate that list")
        browser.findFirst(".navigation-toggle").getAttribute("href") should include("australia-mining-boom-end#footer-nav")
      }
    }

    scenario("Link to US edition", ArticleComponents) {
      Given("I am on any guardian.co.uk page")
      goTo("/world/2012/aug/23/australia-mining-boom-end") { browser =>

        Then("I should see a link to the US edition")

        val editionLink = browser.findFirst("[data-link-name='switch to US edition']")

        editionLink.getAttribute("href") should be(s"http://localhost:${port}/preference/edition/us")
      }
    }

    scenario("Link to UK edition", ArticleComponents) {
      Given("I am on any guardiannews.com page")
      US("/world/2012/aug/23/australia-mining-boom-end") { browser =>

        Then("I should see a link to the UK edition")

        val editionLink = browser.findFirst("[data-link-name='switch to UK edition']")

        editionLink.getAttribute("href") should be(s"http://localhost:${port}/preference/edition/uk")
      }
    }

    scenario("Links to company information", ArticleComponents) {
      Given("I am on any guardian.co.uk page")
      US("/world/2012/aug/23/australia-mining-boom-end") { browser =>

        Then("I should see a link to the contributors section")
        val contributors = browser.find(".l-footer li a", withText().contains("contributors"))
        contributors.length should be > 0

        And("a link to the contact us page")
        val contact = browser.find(".l-footer li a", withText().contains("contact"))
        contact.length should be > 0

        And("a link to the about us page")
        val info = browser.find(".l-footer li a", withText().contains("about us"))
        info.length should be > 0

        And("a link to the complaints and corrections")
        val complaints = browser.find(".l-footer li a", withText().contains("complaints & corrections"))
        complaints.length should be > 0
      }
    }

    scenario("Links to legal information", ArticleComponents) {
      Given("I am on any guardian.co.uk page")
      US("/world/2012/aug/23/australia-mining-boom-end") { browser =>

        Then("I should see a link to the terms & Conditions in the page footer")

        val terms = browser.find(".l-footer li a", withText().contains("terms"))
        terms.length should be > 0

        And("a link to the privacy policy page")
        val privacy = browser.find(".l-footer li a", withText().contains("privacy"))

        privacy.length should be > 0

      }
    }
  }
}
