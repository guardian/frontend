package test

import org.scalatest.matchers.ShouldMatchers
import org.scalatest.{ Informer, GivenWhenThen, FeatureSpec }
import collection.JavaConversions._
import collection.JavaConverters._
import org.fluentlenium.core.domain.{ FluentWebElement, FluentList }
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
  }
}
