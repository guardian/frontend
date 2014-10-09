package football

import driver.Driver
import org.scalatest.tags.Retryable
import org.scalatest.{FlatSpec, Matchers}

@Retryable class MatchReportComponentsTest extends FlatSpec with Matchers with Driver {

  "Match reports" should "have match stats components" in {

    go to theguardian("/football/2014/aug/25/manchester-city-liverpool-premier-league-match-report")

    withClue("should show the 'scores' component") {
      first("[data-component='big-match-special']").text should include("Man City")
    }

    withClue("should pull in the 'Match stats' component") {
      first("[data-component='football-stats-embed']").text should include("Goal attempts")
    }

    withClue("should pull in the 'League table' component") {
      first("[data-component='football-table-embed']").text should include("Premier League")
    }

    withClue("should pull in the 'Fixtures' component") {
      first("[data-component='football-matches-embed']").text should include("Premier League")
    }
  }
}
