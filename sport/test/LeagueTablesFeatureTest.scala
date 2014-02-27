package test

import play.api.test._
import play.api.test.Helpers._
import org.scalatest.{ FeatureSpec, GivenWhenThen }
import org.scalatest.Matchers

class LeagueTablesFeatureTest extends FeatureSpec with GivenWhenThen with Matchers {

  feature("League Tables") {

    scenario("Visit 'all tables' page") {
      Given("I visit the a all tables page")

      HtmlUnit("/football/tables") { browser =>
        import browser._

        Then("I should see the 4 few entries of each table")

        val teams = $(".football-stat--team").getTexts
        teams should contain("Arsenal")
        teams should contain("Man U")
        teams should contain("Man C")
        teams should contain("Chelsea")

        teams should not contain ("Wigan") // 5th in prem league not visible
      }
    }

    scenario("Visit 'competition table' page") {
      Given("I visit the a competition league table page")

      HtmlUnit("/football/premierleague/table") { browser =>
        import browser._

        $("h1").getTexts should contain("Premier League table")
        val teams = $(".table-football-body td").getTexts
        teams should contain("Arsenal")

        teams should contain ("Wigan") // I can now see all items

        $("h1").getTexts should not contain("Championship League table")
      }
    }

    scenario("Should redirect when no competition table data found") {
      val result = football.controllers.LeagueTableController.renderCompetition("sfgsfgsfg")(FakeRequest())
      status(result) should be(303)
    }
  }
}
