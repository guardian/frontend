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
      HtmlUnit("/most-popular/UK/world") { browser =>
        import browser._

        then("The 'World News' tab should be selected by default")
        findFirst(".tabs .tabs-selected").getText should include("World news")
        and("it should contain world news")
        $("#tabs-popular-1 li").size should be > (0)

      }
    }

    scenario("Viewing site-wide most popular") {

      given("I am on a page in the 'World' section")
      HtmlUnit("/most-popular/UK/world") { browser =>
        import browser._

        then("I should see a tab containing site-wide popular news")
        $(".tabs li")(1).getText should include("The Guardian")
        $("#tabs-popular-2 li").size should be > (0)

      }
    }

    scenario("Most popular for a US edition section") {

      given("I am on a page in the 'Comment is free' section in the US edition")
      HtmlUnit.US("/most-popular/US/commentisfree") { browser =>
        import browser._

        then("The 'Comment is free' tab should be selected by default")
        findFirst(".tabs .tabs-selected").getText should include("Comment is free")
        and("it should contain popular 'Comment is free' articles")
        $("#tabs-popular-1 li").size should be > (0)
      }
    }

    scenario("Most popular caching") {
      given("I load most popular")
      HtmlUnit.connection("/most-popular/UK") { connection =>
        then("the requested should be cached for 15 minutes")
        connection.getHeaderFields.get("Cache-Control").head should be("public, max-age=900")
      }
    }
  }
}
