package test

import org.scalatest.Matchers
import org.scalatest.{ Informer, GivenWhenThen, FeatureSpec }
import collection.JavaConversions._
import collection.JavaConverters._
import org.fluentlenium.core.domain.{ FluentWebElement, FluentList }
import org.fluentlenium.core.filter.FilterConstructor._

import conf.Configuration
import common.UsesElasticSearch

class SectionNavigationFeatureTest extends FeatureSpec with GivenWhenThen with Matchers  with UsesElasticSearch {

  implicit val config = Configuration

  feature("Section Navigation") {

    scenario("Links to sections", ArticleComponents) {

      Given("I am on any guardian.co.uk page")
      HtmlUnit("/world/2012/aug/23/australia-mining-boom-end") { browser =>
        import browser._

        Then("I should see a list of top sections")

        val sections = find("#footer-nav li a")

        sections.length should be > 0

        And("a button to activate that list")
        findFirst(".control--sections").getAttribute("href") should include("australia-mining-boom-end#footer-nav")
      }
    }

    scenario("Link to US edition", ArticleComponents) {
      Given("I am on any guardian.co.uk page")
      HtmlUnit("/world/2012/aug/23/australia-mining-boom-end") { browser =>
        import browser._

        Then("I should see a link to the US edition")

        val editionLink = findFirst("[data-link-name='switch to US edition']")

        editionLink.getAttribute("href") should be("http://localhost:9000/preference/edition/us")
      }
    }

    scenario("Link to UK edition", ArticleComponents) {
      Given("I am on any guardiannews.com page")
      HtmlUnit.US("/world/2012/aug/23/australia-mining-boom-end") { browser =>
        import browser._

        Then("I should see a link to the UK edition")

        val editionLink = findFirst("[data-link-name='switch to UK edition']")

        editionLink.getAttribute("href") should be("http://localhost:9000/preference/edition/uk")
      }
    }

    scenario("Links to user information", ArticleComponents) {
      Given("I am on any guardian.co.uk page")
      HtmlUnit.US("/world/2012/aug/23/australia-mining-boom-end") { browser =>
        import browser._

        Then("I should see a link to the help section")

        val help = find(".footer li a", withText().contains("Help"))
        help.length should be > 0

        And("a link to the contact us page")
        val contact = find(".footer li a", withText().contains("Contact"))

        contact.length should be > 0

      }
    }

    scenario("Links to legal information", ArticleComponents) {
      Given("I am on any guardian.co.uk page")
      HtmlUnit.US("/world/2012/aug/23/australia-mining-boom-end") { browser =>
        import browser._

        Then("I should see a link to the terms & Conditions in the page footer")

        val terms = find(".footer li a", withText().contains("Terms"))
        terms.length should be > 0

        And("a link to the privacy policy page")
        val privacy = find(".footer li a", withText().contains("Privacy"))

        privacy.length should be > 0

      }
    }

  }

}
