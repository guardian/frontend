package test

import org.scalatest.matchers.ShouldMatchers
import org.scalatest.{ Informer, GivenWhenThen, FeatureSpec }
import collection.JavaConversions._
import collection.JavaConverters._
import org.fluentlenium.core.domain.{ FluentWebElement, FluentList }
import org.fluentlenium.core.filter.FilterConstructor._

import conf.Configuration

class SectionNavigationFeatureTest extends FeatureSpec with GivenWhenThen with ShouldMatchers {

  implicit val config = Configuration

  feature("Section Navigation") {

    scenario("Links to sections", ArticleComponents) {

      given("I am on any guardian.co.uk page")
      HtmlUnit("/world/2012/aug/23/australia-mining-boom-end") { browser =>
        import browser._

        then("I should see a list of top sections")

        val sections = find("#sections-footer li a")

        sections.length should be > 0

        and("a button to activate that list")
        $("#navigation-header a")(1).getAttribute("href") should include("australia-mining-boom-end#sections")
      }
    }

    scenario("Link to US edition of article", ArticleComponents) {
      given("I am on any guardian.co.uk page")
      HtmlUnit("/world/2012/aug/23/australia-mining-boom-end") { browser =>
        import browser._

        then("I should see a link to the US edition")

        val editionLink = findFirst("[data-link-name='switch to us edition']")

        editionLink.getAttribute("href") should be("http://127.0.0.1:9000/world/2012/aug/23/australia-mining-boom-end")
      }
    }

    scenario("Link to UK edition of article", ArticleComponents) {
      given("I am on any guardiannews.com page")
      HtmlUnit.US("/world/2012/aug/23/australia-mining-boom-end") { browser =>
        import browser._

        then("I should see a link to the UK edition")

        val editionLink = findFirst("[data-link-name='switch to uk edition']")

        editionLink.getAttribute("href") should be("http://localhost:9000/world/2012/aug/23/australia-mining-boom-end")
      }
    }

    scenario("Links to user information", ArticleComponents) {
      given("I am on any guardian.co.uk page")
      HtmlUnit.US("/world/2012/aug/23/australia-mining-boom-end") { browser =>
        import browser._

        then("I should see a link to the help section")

        val help = find(".footer li a", withText().contains("Help"))
        help.length should be > 0

        and("a link to the contact us page")
        val contact = find(".footer li a", withText().contains("Contact"))

        contact.length should be > 0

      }
    }

    scenario("Links to legal information", ArticleComponents) {
      given("I am on any guardian.co.uk page")
      HtmlUnit.US("/world/2012/aug/23/australia-mining-boom-end") { browser =>
        import browser._

        then("I should see a link to the terms & Conditions in the page footer")

        val terms = find(".footer p a", withText().contains("Terms"))
        terms.length should be > 0

        and("a link to the privacy policy page")
        val privacy = find(".footer p a", withText().contains("Privacy"))

        privacy.length should be > 0

      }
    }

  }

}
