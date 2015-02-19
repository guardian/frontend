package integration

import org.scalatest.tags.Retryable
import org.scalatest.{BeforeAndAfterAll, DoNotDiscover, FlatSpec, Matchers}

@DoNotDiscover @Retryable class FootballLiveBlogComponentsTest extends FlatSpec with Matchers with SharedWebDriver with BeforeAndAfterAll {

  "Football live blogs" should "have match stats components" in {

    get("/football/live/2014/aug/16/-sp-arsenal-v-crystal-palace-premier-league-live-report")
    implicitlyWait(10)

    withClue("should show the 'scores' component") {
      first("[data-component='big-match-special']").getText() should include("Arsenal")
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
