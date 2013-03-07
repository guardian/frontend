package test

import org.scalatest.matchers.ShouldMatchers
import org.scalatest.{ GivenWhenThen, FeatureSpec }
import scala.collection.JavaConversions._

class MostPopularFeatureTest extends FeatureSpec with GivenWhenThen with ShouldMatchers {

  feature("Most popular") {

    // Feature

    info("In order to explore the most popular Guardian stories")
    info("As a Guardian Reader")
    info("I want to read the most read stories across the guardian and within the section I'm in")

    // Metrics

    info("Interactions on the Most read area at the bottom of the page should be +2% of overall page views")

    // Scenarios

    scenario("Most popular for a section") {

      given("I am on a page in the 'World' section")
      HtmlUnit("/most-read/world") { browser =>
        import browser._

        then("I should see a list of 'world' content")
        findFirst(".front-section").findFirst("h1").getText should be("Most read: World news")
        and("it should contain world news")
        $(".front-section li").size should be > (0)

      }
    }

    scenario("Viewing site-wide most popular") {

      given("I am on a page in the 'World' section")
      HtmlUnit("/most-read/world") { browser =>
        import browser._

        then("I should see the site wide most read")
        $("h1")(1).getText should be("Most read: The Guardian")
      }
    }

    scenario("Most popular caching") {
      given("I load most popular")
      HtmlUnit.connection("/most-read") { connection =>
        then("the requested should be cached for 15 minutes")
        connection.getHeaderFields.get("Cache-Control").head should be("public, max-age=900")
      }
    }
  }
}
