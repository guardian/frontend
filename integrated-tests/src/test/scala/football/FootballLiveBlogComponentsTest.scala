package football

import driver.Driver
import org.scalatest.concurrent.Eventually
import org.scalatest.{FreeSpec, Matchers}


class FootballLiveBlogComponentsTest extends FreeSpec with Matchers with Driver with Eventually {

  "Football live blogs" - {


    go to theguardian("/football/live/2014/aug/16/-sp-arsenal-v-crystal-palace-premier-league-live-report")

    "should show the 'scores' component" in {
      first("[data-component='big-match-special']").text should include("Arsenal")
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
