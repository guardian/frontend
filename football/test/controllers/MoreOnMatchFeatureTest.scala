package test

import org.scalatest.matchers.ShouldMatchers
import org.scalatest.{ GivenWhenThen, FeatureSpec }
import org.joda.time.DateTime
import pa.{ MatchDayTeam, Result }
import feed.Competitions
import io.Source

class MoreOnMatchFeatureTest extends FeatureSpec with GivenWhenThen with ShouldMatchers {

  val matches = Seq(
    Result("1234", new DateTime(2012, 12, 1, 15, 0), None, "", false, None,
      MatchDayTeam("1006", "", None, None, None, None),
      MatchDayTeam("65", "", None, None, None, None),
      None, None, None
    ))

  feature("More on match") {

    scenario("View content related to a match") {

      given("I visit a match page")

      Fake {
        Competitions.setMatches("100", matches)
      }

      HtmlUnit.connection("/football/api/match-nav/2012/12/01/1006/65?callback=showMatch") { connection =>

        val json = Source.fromInputStream(connection.getInputStream).mkString

        then("I should see the match report")
        json should include("/football/2012/dec/02/arsenal-swansea-match-report-michu")

        and("I should see the stats page")
        json should include("/football/match/")
      }
    }
  }
}
