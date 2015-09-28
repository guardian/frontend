package rugby.jobs

import org.joda.time.DateTime
import org.scalatest._
import org.scalatest.concurrent.Eventually
import test.ConfiguredTestSuite
import rugby.model._
import rugby.feed.WarmupWorldCup2015
import scala.concurrent.Future
import scala.language.reflectiveCalls

@DoNotDiscover class RugbyStatsJobTest extends FreeSpec with ShouldMatchers with ConfiguredTestSuite with Eventually {

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
      awayTeam = awayTeamOld,
      venue = Some("kings cross"),
      competitionName = "competition",
      status = Status.Result,
      event = WarmupWorldCup2015,
      stage = Stage.Group
    ),
    Match(
      date = testDate.plusSeconds(1),
      id = "match id",
      homeTeam = homeTeamNew,
      awayTeam = awayTeamNew,
      venue = Some("kings cross"),
      competitionName = "competition",
      status = Status.Result,
      event = WarmupWorldCup2015,
      stage = Stage.Group
    ))

  "RugbyStatsJob" - {
    "should update a live match with new score data" in {

      val testStatsJob = new RugbyStatsJob {
        def allFixtures = fixturesAndResultsMatches.get()
        def liveMatches = liveScoreMatches.get()
      }

      testStatsJob.allFixtures.size should be (0)
      testStatsJob.liveMatches.size should be (0)

      testStatsJob.sendLiveScores(Future.successful(List(oldMatch)))

      eventually {
        testStatsJob.allFixtures.size should be(0)
        testStatsJob.liveMatches.size should be(1)
      }

      val oldMatchData = testStatsJob.getLiveScore("2015", "08", "24", "1", "2")

      oldMatchData shouldBe defined
      oldMatchData.flatMap(_.homeTeam.score) should be (Some(10))

      testStatsJob.sendLiveScores(Future.successful(List(newMatch)))

      eventually {
        testStatsJob.allFixtures.size should be(0)
        testStatsJob.liveMatches.size should be(1)

        val matchData = testStatsJob.getLiveScore("2015", "08", "24", "1", "2")
        matchData.flatMap(_.homeTeam.score) should be (Some(20))
      }
    }

    "should find a match even when the team ids are reversed" in {
      val testStatsJob = new RugbyStatsJob {}

      testStatsJob.sendLiveScores(Future.successful(List(oldMatch)))

      eventually {
        testStatsJob.getLiveScore("2015", "08", "24", "2", "1") shouldBe defined
      }
    }

  }
}
