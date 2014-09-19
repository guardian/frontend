package football

import driver.Driver
import org.scalatest.{FlatSpec, Matchers}


class FootballLiveBlogComponentsTest extends FlatSpec with Matchers with Driver {

  "Football live blogs" should "have match stats components" in retryPage {

    go to theguardian("/football/live/2014/aug/16/-sp-arsenal-v-crystal-palace-premier-league-live-report")

    withClue("should show the 'scores' component") {
      first("[data-component='big-match-special']").text should include("Arsenal")
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
