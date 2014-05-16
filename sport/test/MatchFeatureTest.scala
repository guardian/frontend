package test

import org.scalatest.Matchers
import org.scalatest.{ GivenWhenThen, FeatureSpec }
import scala.collection.JavaConversions._

class MatchFeatureTest extends FeatureSpec with GivenWhenThen with Matchers {

  feature("MatchPage") {

    scenario("Visit match page") {

      Given("I visit a match page")

      HtmlUnit("/football/match/3518296") { browser =>
        import browser._

        Then("I should see the home team score")
        $("h2").getTexts should contain("Derby 0")

        And("I should see the away team score")
        $("h2").getTexts should contain("Blackburn 1")

        And("I should see the home possession")
        findFirst("[data-chart-class=chart--football-possession]").findFirst(".bar-fight__bar--home").getText should be("54")

        And("I should see the away possession")
        findFirst("[data-chart-class=chart--football-possession]").findFirst(".bar-fight__bar--away").getText should be("46")

        And("I should see the home corners")
        findFirst("[data-stat-type='corners'][class*='--home']").getText should be("7")

        And("I should see the away corners")
        findFirst("[data-stat-type='corners'][class*='--away']").getText should be("5")

        And("I should see the home fouls")
        findFirst("[data-stat-type='fouls'][class*='--home']").getText should be("13")

        And("I should see the away fouls")
        findFirst("[data-stat-type='fouls'][class*='--away']").getText should be("10")

        And("I should see the home offsides")
        findFirst("[data-stat-type='offsides'][class*='--home']").getText should be("2")

        And("I should see the away offsides")
        findFirst("[data-stat-type='offsides'][class*='--away']").getText should be("1")

        And("I should see the home team lineup")
        findFirst(".team-list").getText should include("John Brayford")

        And("I should see the away team lineup")
        $(".team-list")(1).getText should include("Colin Kazim-Richards")
      }
    }
  }
}
