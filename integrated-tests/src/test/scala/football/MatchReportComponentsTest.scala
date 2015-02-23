package integration

import org.scalatest.tags.Retryable
import org.scalatest.{FlatSpec, DoNotDiscover, Matchers}

@DoNotDiscover @Retryable class MatchReportComponentsTest extends FlatSpec with Matchers with SharedWebDriver {

  "Match reports" should "have match stats components" in {

    get("/football/2014/aug/25/manchester-city-liverpool-premier-league-match-report")
    implicitlyWait(5)

    withClue("should show the 'scores' component") {
      first("[data-component='big-match-special']").getText() should include("Man City")
    }

    withClue("should pull in the 'Match stats' component") {
      first("[data-component='football-stats-embed']").getText() should include("Goal attempts")
    }

    withClue("should pull in the 'League table' component") {
      first("[data-component='football-table-embed']").getText() should include("Premier League")
    }

    withClue("should pull in the 'Fixtures' component") {
      first("[data-component='football-matches-embed']").getText() should include("Premier League")
    }

  }
}
