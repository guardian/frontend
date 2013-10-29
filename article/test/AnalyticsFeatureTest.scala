package test

import org.scalatest.Matchers
import org.scalatest.{ Informer, GivenWhenThen, FeatureSpec }
import collection.JavaConversions._
import collection.JavaConverters._
import org.fluentlenium.core.domain.{ FluentWebElement, FluentList }
import conf.Configuration
import conf.Switches._

class AnalyticsFeatureTest extends FeatureSpec with GivenWhenThen with Matchers {

  implicit val config = Configuration

  feature("Analytics") {

    // Feature 

    info("In order understand how people are using the website and provide data for auditing")
    info("As a product manager")
    info("I want record usage metrics")

    // Scenarios

    scenario("Omniture tracks user actions") {

      Given("I am on an article entitled 'Olympic opening ceremony will recreate countryside with real animals'")
      HtmlUnit("/sport/2012/jun/12/london-2012-olympic-opening-ceremony") { browser =>
        import browser._

        Then("the Omniture webbug should record my visit")
        val webbug = findFirst("#omnitureNoScript img")

        webbug.getAttribute("src") should startWith("http://hits.theguardian.com/b/ss/guardiangu-frontend-dev/1/H.24.2/")

        // test a few token properties in the web bug
        webbug.getAttribute("src") should include("c11=sport")
        webbug.getAttribute("src") should include("c8=1758359")
        webbug.getAttribute("src") should include("pageName=GFE%3Asport%3AArticle%3Alondon-2012-olympic-opening-ceremony")

      }
    }

    scenario("Ensure all clicked links are recorded by Omniture") {
      Given("I am on an article entitled 'Olympic opening ceremony will recreate countryside with real animals'")
      HtmlUnit("/sport/2012/jun/12/london-2012-olympic-opening-ceremony") { browser =>
        import browser._
        Then("all links on the page should be decorated with the Omniture meta-data attribute")
        val anchorsWithNoDataLink = find("a").filter(hasNoLinkName(_))
        anchorsWithNoDataLink should have length (0)
      }

    }

    scenario("Ophan tracks user actions")(pending)

  }

  private def hasNoLinkName(e: FluentWebElement) = e.getAttribute("data-link-name") == null

}
