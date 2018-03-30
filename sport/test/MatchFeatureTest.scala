package test

import org.scalatest.{DoNotDiscover, FeatureSpec, GivenWhenThen, Matchers}

import scala.collection.JavaConverters._

@DoNotDiscover class MatchFeatureTest
  extends FeatureSpec
  with GivenWhenThen
  with Matchers
  with ConfiguredTestSuite {

  feature("MatchPage") {

    scenario("Visit match page") {

      Given("I visit a match page")

      goTo("/football/match/3834132") { browser =>
        import browser._

        val teams = $("h2").texts.asScala.map(_.replaceAll("\n", " "))
        Then("I should see the home team score")
        teams should contain("Stoke")

        And("I should see the away team score")
        teams should contain("Villa")

        And("I should see the home possession")
        el("[data-chart-class=chart--football-possession]").el(".bar-fight__bar--home").text should be("57")

        And("I should see the away possession")
        el("[data-chart-class=chart--football-possession]").el(".bar-fight__bar--away").text should be("43")

        And("I should see the home corners")
        el("[data-stat-type='corners'][class*='--home']").text should be("11")

        And("I should see the away corners")
        el("[data-stat-type='corners'][class*='--away']").text should be("0")

        And("I should see the home fouls")
        el("[data-stat-type='fouls'][class*='--home']").text should be("7")

        And("I should see the away fouls")
        el("[data-stat-type='fouls'][class*='--away']").text should be("15")

        And("I should see the home team lineup")
        el(".match-stats__lineup--home").text should include("Shaqiri")

        And("I should see the away team lineup")
        el(".match-stats__lineup--away").text should include("Agbonlahor")
      }
    }
  }
}
