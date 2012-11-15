package test

import org.scalatest.{ FeatureSpec, GivenWhenThen }
import org.scalatest.matchers.ShouldMatchers

class TablesFeatureTest extends FeatureSpec with GivenWhenThen with ShouldMatchers {

  feature("Tables") {

    scenario("The 'Desktop version' link points to the correct, equivalent desktop page") {

      given("I visit the tables page")
      and("I am on the 'UK' edition")
      HtmlUnit("/football/tables") { browser =>
        import browser._

        then("the 'Desktop version' link should point to 'http://www.guardian.co.uk/football/matches?mobile-redirect=false'")
        findFirst("#main-site").getAttribute("href") should be("http://www.guardian.co.uk/football/matches?mobile-redirect=false")
      }

      given("I visit the tables page")
      and("I am on the 'US' edition")
      HtmlUnit.US("/football/tables") { browser =>
        import browser._

        then("the 'Desktop version' link should point to 'http://www.guardiannews.com/football/matches?mobile-redirect=false'")
        findFirst("#main-site").getAttribute("href") should be("http://www.guardiannews.com/football/matches?mobile-redirect=false")
      }

    }

  }
}
