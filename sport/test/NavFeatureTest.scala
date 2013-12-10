package test

import org.scalatest.{ FeatureSpec, GivenWhenThen }
import org.scalatest.Matchers
import collection.JavaConversions._

class NavFeatureTest extends FeatureSpec with GivenWhenThen with Matchers {

  feature("Football Nav") {

    scenario("Visit the results front") {

      Given("I visit the results front")

      HtmlUnit("/football/results") { browser =>
        import browser._

        Then("the live link should point to all live matches")
        findFirst("[data-link-name=livescores]").getAttribute("href") should endWith("/football/live")

        Then("the fixtures link should point to all fixtures")
        findFirst("[data-link-name=fixtures]").getAttribute("href") should endWith("/football/fixtures")

        Then("the tables link should point to all tables")
        findFirst("[data-link-name=tables]").getAttribute("href") should endWith("/football/tables")
      }

    }

    scenario("Visit the results front for a specific competition") {

      Given("I visit the premier league results front")

      HtmlUnit("/football/premierleague/results") { browser =>
        import browser._

        Then("the live link should point to premier league live matches")
        findFirst("[data-link-name=livescores]").getAttribute("href") should endWith("/football/premierleague/live")

        Then("the fixtures link should point to premier league fixtures")
        findFirst("[data-link-name=fixtures]").getAttribute("href") should endWith("/football/premierleague/fixtures")

        Then("the tables link should point to premier league tables")
        findFirst("[data-link-name=tables]").getAttribute("href") should endWith("/football/premierleague/table") // note singular not plural for comp tables
      }

    }

    scenario("Visit the fixtures front for a specific competition") {

      Given("I visit the premier league results front")

      HtmlUnit("/football/premierleague/fixtures") { browser =>
        import browser._

        Then("the live link should point to premier league live matches")
        findFirst("[data-link-name=livescores]").getAttribute("href") should endWith("/football/premierleague/live")

        Then("the results link should point to premier league results")
        findFirst("[data-link-name=results]").getAttribute("href") should endWith("/football/premierleague/results")

        Then("the tables link should point to premier league tables")
        findFirst("[data-link-name=tables]").getAttribute("href") should endWith("/football/premierleague/table") // note singular not plural for comp tables
      }

    }

    scenario("Visit the live front for a specific competition") {

      Given("I visit the premier league results front")

      HtmlUnit("/football/premierleague/live") { browser =>
        import browser._

        Then("the fixtures link should point to premier league fixtures")
        findFirst("[data-link-name=fixtures]").getAttribute("href") should endWith("/football/premierleague/fixtures")

        Then("the results link should point to premier league results")
        findFirst("[data-link-name=results]").getAttribute("href") should endWith("/football/premierleague/results")

        Then("the tables link should point to premier league tables")
        findFirst("[data-link-name=tables]").getAttribute("href") should endWith("/football/premierleague/table") // note singular not plural for comp tables
      }

    }

  }
}
