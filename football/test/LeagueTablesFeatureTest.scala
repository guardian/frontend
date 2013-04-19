package test

import play.api.test._
import play.api.test.Helpers._
import org.scalatest.{ FeatureSpec, GivenWhenThen }
import org.scalatest.matchers.ShouldMatchers
import play.api.libs.ws.WS

class LeagueTablesFeatureTest extends FeatureSpec with GivenWhenThen with ShouldMatchers {
    WS
  feature("League Tables") {

    scenario("User cannot filter league table by a competition which isn't a league") {

      Given("I visit the league tables page")

      HtmlUnit("/football/tables") { browser =>
        import browser._

        val expectedLeagueTableLinks: Array[String] = Array(
          "Premier League",
          "Championship",
          "League One",
          "League Two",
          "Champions League",
          "Europa League",
          "La Liga",
          "Scottish Premier League",
          "Scottish Division One",
          "Scottish Division Two",
          "Scottish Division Three",
          "World Cup 2014 qualifiers",
          "View all tables"
        )
        $("#js-football-league-list a").getTexts().toArray() should be(expectedLeagueTableLinks)
      }

    }

    scenario("Should show league table for competition") {
      Given("I visit the a competition league table page")

      HtmlUnit("/football/premierleague/table") { browser =>
        import browser._

        $("h1").getTexts should contain("Premier League table")
        $(".table-football-body td").getTexts should contain("Arsenal")
      }

    }

    scenario("Should redirect when no competition table data found") {
      val result = controllers.LeagueTableController.renderCompetition("sfgsfgsfg")(FakeRequest())
      status(result) should be(303)
    }
  }
}
