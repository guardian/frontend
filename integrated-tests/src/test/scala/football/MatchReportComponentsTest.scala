package football

import driver.Driver
import org.scalatest.concurrent.Eventually
import org.scalatest.{FreeSpec, Matchers}


class MatchReportComponentsTest extends FreeSpec with Matchers with Driver with Eventually {

  "Match reports" - {


    go to theguardian("/football/2014/aug/25/manchester-city-liverpool-premier-league-match-report")

    "should show the 'scores' component" in {
      first("[data-component='big-match-special']").text should include("Man City")
    }

    "should pull in the 'Match stats' component" in {
      first("[data-component='football-stats-embed']").text should include("Goal attempts")
    }

    "should pull in the 'League table' component" in {
      first("[data-component='football-table-embed']").text should include("Premier League")
    }

    "should pull in the 'Fixtures' component" in {
      first("[data-component='football-matches-embed']").text should include("Premier League")
    }
  }

}
