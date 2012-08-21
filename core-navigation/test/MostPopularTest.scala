package test

import org.scalatest.matchers.ShouldMatchers
import org.scalatest.{ GivenWhenThen, FeatureSpec }
import scala.collection.JavaConversions._

class MostPopularTest extends FeatureSpec with GivenWhenThen with ShouldMatchers {

  feature("Most popular") {

    scenario("Most popular for a section") {

      given("I am on a page in the 'World' section")
      HtmlUnit("/most-popular/UK/world") { browser =>
        import browser._

        then("I should see the popular on World news tab")
        findFirst(".tabs .tabs-selected").getText should include("World news")
        $("#most-popular-1 li").size should be > (0)

        and("I should see the global popular tab")
        $(".tabs li")(1).getText should include("guardian.co.uk")
        $("#most-popular-2 li").size should be > (0)
      }
    }

    scenario("Most popular for a section US edition") {

      given("I am on a page in the 'Comment is free' section in the US edition")
      HtmlUnit("/most-popular/US/commentisfree") { browser =>
        import browser._

        then("I should see the popular on World news tab")
        findFirst(".tabs .tabs-selected").getText should include("Comment is free")
        $("#most-popular-1 li").size should be > (0)

        and("I should see the global popular tab")
        $(".tabs li")(1).getText should include("guardian.co.uk")
        $("#most-popular-2 li").size should be > (0)
      }
    }

    scenario("Most popular for the network front") {

      given("I am on the network front")
      HtmlUnit("/most-popular/UK") { browser =>
        import browser._

        then("I should see the global most popular")
        findFirst(".tabs .tabs-selected").getText should include("guardian.co.uk")
        $("#most-popular-1 li").size should be > (0)

        and("there should not be another tab")
        $(".tabs li").size should be(1)
      }
    }

    scenario("Most popular for the network front US edition") {

      given("I am on the network front in the US edition")
      HtmlUnit("/most-popular/US") { browser =>
        import browser._

        then("I should see the global most popular")
        findFirst(".tabs .tabs-selected").getText should include("guardian.co.uk")
        $("#most-popular-1 li").size should be > (0)

        and("there should not be another tab")
        $(".tabs li").size should be(1)
      }
    }

    scenario("Caching") {
      given("I load most popular")
      HtmlUnit.connection("/most-popular/UK") { connection =>
        then("the call should be correctly cached")
        connection.getHeaderFields.get("Cache-Control").head should be("must-revalidate, max-age=900")
      }
    }
  }
}