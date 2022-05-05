package test

import football.controllers.LeagueTableController
import play.api.test._
import play.api.test.Helpers._
import org.scalatest._
import org.scalatest.featurespec.AnyFeatureSpec
import org.scalatest.matchers.should.Matchers

@DoNotDiscover class LeagueTablesFeatureTest
    extends AnyFeatureSpec
    with GivenWhenThen
    with Matchers
    with ConfiguredTestSuite
    with FootballTestData
    with WithTestExecutionContext
    with WithTestFootballClient
    with BeforeAndAfterAll
    with WithMaterializer
    with WithTestApplicationContext
    with WithTestWsClient {

  Feature("League Tables") {

    Scenario("Visit 'all tables' page") {
      Given("I visit the a all tables page")

      goTo("/football/tables") { browser =>
        import browser._

        Then("I should see the 4 few entries of each table")

        val teams = $(".team-name__long").texts
        teams should contain("Arsenal")
        teams should contain("Man U")
        teams should contain("Man C")
        teams should contain("Chelsea")

        teams should not contain "Wigan" // 5th in prem league not visible

        And("I should have a generic H1, with league name H2s")

        Then("The <h1> Should be tables")
        val h2 = $("h2")
        $("h1").texts should contain("Football tables")
        h2.texts should contain("Premier League")
        h2.texts should contain("Champions League")
      }
    }

    Scenario("Visit 'competition table' page") {
      Given("I visit the a competition league table page")

      goTo("/football/premierleague/table") { browser =>
        import browser._

        Then("I should see all the teams in this league")
        val teams = $(".team-name__long").texts
        teams should contain("Arsenal")
        teams should contain("Wigan") // I can now see all items

        And("I should see a nice SEO h1 el on the page, describing the current competition")
        $("h1").texts should contain("Premier League")
        $("h1").texts should not contain "Championship League"
      }
    }

    Scenario("Should redirect when no competition table data found") {
      val leagueTableController =
        new LeagueTableController(testCompetitionsService, play.api.test.Helpers.stubControllerComponents())
      val result = leagueTableController.renderCompetition("sfgsfgsfg")(FakeRequest())
      status(result) should be(303)
    }

  }
}
