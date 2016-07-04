package test

import org.scalatest.{DoNotDiscover, Matchers, GivenWhenThen, FeatureSpec}
import scala.collection.JavaConversions._

@DoNotDiscover class MatchFeatureTest extends FeatureSpec with GivenWhenThen with Matchers with ConfiguredTestSuite {

  feature("MatchPage") {

    scenario("Visit match page") {

      Given("I visit a match page")

      goTo("/football/match/3834132") { browser =>
        import browser._

        Then("I should see the home team score")
        $("h2").getTexts should contain("Stoke 1")

        And("I should see the away team score")
        $("h2").getTexts should contain("Villa 1")

        And("I should see the home possession")
        findFirst("[data-chart-class=chart--football-possession]").findFirst(".bar-fight__bar--home").getText should be("57")

        And("I should see the away possession")
        findFirst("[data-chart-class=chart--football-possession]").findFirst(".bar-fight__bar--away").getText should be("43")

        And("I should see the home corners")
        findFirst("[data-stat-type='corners'][class*='--home']").getText should be("11")

        And("I should see the away corners")
        findFirst("[data-stat-type='corners'][class*='--away']").getText should be("0")

        And("I should see the home fouls")
        findFirst("[data-stat-type='fouls'][class*='--home']").getText should be("7")

        And("I should see the away fouls")
        findFirst("[data-stat-type='fouls'][class*='--away']").getText should be("15")

        And("I should see the home offsides")
        findFirst("[data-stat-type='offsides'][class*='--home']").getText should be("2")

        And("I should see the away offsides")
        findFirst("[data-stat-type='offsides'][class*='--away']").getText should be("2")

        And("I should see the home team lineup")
        findFirst(".team-list").getText should include("Mame Diouf")

        And("I should see the away team lineup")
        $(".team-list")(1).getText should include("Gabriel Agbonlahor")
      }
    }
  }
}
