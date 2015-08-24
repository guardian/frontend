package rugby.jobs

import org.joda.time.DateTime
import org.scalatest._
import org.scalatest.concurrent.Eventually
import test.ConfiguredTestSuite
import rugby.model._
import scala.concurrent.Future
import scala.language.reflectiveCalls

@DoNotDiscover class RugbyStatsJobTest extends FreeSpec with ShouldMatchers with ConfiguredTestSuite with Eventually {

  "RugbyStatsJob" - {
    "should update a live match with new score data" in {

      val testDate = new DateTime(2015, 8, 24, 0, 0)

      val (homeTeamOld, homeTeamNew, awayTeamOld, awayTeamNew) = (
        Team("1", "home", Some(10)),
        Team("1", "home", Some(20)),
        Team("2", "away", Some(30)),
        Team("2", "away", Some(40)))

      val (oldMatch, newMatch) = (
        Match(
          date = testDate,
          id = "match id",
          homeTeam = homeTeamOld,
          awayTeam = awayTeamOld
        ),
        Match(
          date = testDate.plusSeconds(1),
          id = "match id",
          homeTeam = homeTeamNew,
          awayTeam = awayTeamNew
        ))

      val testStatsJob = new RugbyStatsJob {
        def allFixtures = fixturesAndResultsMatches.get()
        def liveMatches = liveScoreMatches.get()
      }

      testStatsJob.allFixtures.size should be(0)
      testStatsJob.liveMatches.size should be(0)

      testStatsJob.sendLiveScores(Future.successful(List(oldMatch)))

      eventually {
        testStatsJob.allFixtures.size should be(0)
        testStatsJob.liveMatches.size should be(1)

        val matchData = testStatsJob.getLiveScore("2015", "08", "24", "1", "2")

        matchData shouldBe defined
      }
    }
  }
}
