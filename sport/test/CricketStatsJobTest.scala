package test

import conf.cricketPa.{CompetitionMatch, CricketTeam, CricketTeams, PaFeed}
import cricketModel.{Match, Team}
import jobs.CricketStatsJob
import jobs.CricketStatsJob.MatchType
import org.mockito.ArgumentMatchers.{any, eq => eqTo}
import org.mockito.Mockito.{clearInvocations, never, times, verify, when}
import org.scalatest.DoNotDiscover
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.scalatestplus.mockito.MockitoSugar

import java.time.{LocalDate, LocalDateTime}
import scala.concurrent.{ExecutionContext, Future}

@DoNotDiscover class CricketStatsJobTest extends AnyFlatSpec with Matchers with MockitoSugar {

  import CricketStatsJobTest._

  "discoverMatches" should "load a newly discovered match exactly once" in {
    val paFeed = stubbedFeed(england, Seq(upcoming))
    val job = new CricketStatsJob(paFeed)

    job.discoverMatches(fromDate = today.minusMonths(2), toDate = today.plusMonths(2)) // loads it once

    verify(paFeed).getMatch(eqTo(upcoming))(any())
  }

  it should "not re-fetch a match that is already cached" in {
    val paFeed = stubbedFeed(england, Seq(historical))
    val job = new CricketStatsJob(paFeed)

    job.discoverMatches(fromDate = today.minusMonths(2), toDate = today.plusMonths(2)) // loads it once
    clearInvocations(paFeed)
    job.discoverMatches(
      fromDate = today.minusMonths(2),
      toDate = today.plusMonths(2),
    ) // already cached, so should be skipped

    verify(paFeed, never).getMatch(eqTo(historical))(any())
  }

  "infrequentMatchDataRefresh" should "never fetches active matches" in {
    val paFeed = stubbedFeed(england, Seq(upcoming, active, future, historical))
    val job = new CricketStatsJob(paFeed)

    job.discoverMatches(fromDate = today.minusMonths(2), toDate = today.plusMonths(2)) // populate the registry
    clearInvocations(paFeed)

    job.infrequentMatchDataRefresh()

    verify(paFeed, never).getMatch(eqTo(active))(any())
  }

  "frequentMatchDataRefresh" should "only fetches active matches" in {
    val paFeed = stubbedFeed(england, Seq(upcoming, active, historical))
    val job = new CricketStatsJob(paFeed)

    job.discoverMatches(fromDate = today.minusMonths(2), toDate = today.plusMonths(2)) // populate the registry
    clearInvocations(paFeed)

    job.frequentMatchDataRefresh()

    verify(paFeed, never).getMatch(eqTo(upcoming))(any())
    verify(paFeed).getMatch(eqTo(active))(any())
    verify(paFeed, never).getMatch(eqTo(historical))(any())
  }

  "classify" should "mark a single-day match happening today as Active" in {
    CricketStatsJob.classify(today, today) shouldBe MatchType.Active
  }

  it should "mark a match spanning today (start before, end after) as Active" in {
    CricketStatsJob.classify(today.minusDays(2), today.plusDays(2)) shouldBe MatchType.Active
  }

  it should "mark a match that started earlier and ends today as Active" in {
    // Boundary: today is the final day (e.g. day 5 of a test match).
    CricketStatsJob.classify(today.minusDays(4), today) shouldBe MatchType.Active
  }

  it should "mark a match that starts today and ends later as Active" in {
    // Boundary: today is the first day of a multi-day match.
    CricketStatsJob.classify(today, today.plusDays(4)) shouldBe MatchType.Active
  }

  it should "mark a match starting tomorrow as Upcoming" in {
    CricketStatsJob.classify(today.plusDays(1), today.plusDays(3)) shouldBe MatchType.Upcoming
  }

  it should "mark a match starting within the upcoming window as Upcoming" in {
    // upcomingDays is 5, so a start 4 days out is still upcoming.
    CricketStatsJob.classify(today.plusDays(4), today.plusDays(6)) shouldBe MatchType.Upcoming
  }

  it should "mark a match starting exactly on the upcoming boundary as Future" in {
    // The window is exclusive: start == today + upcomingDays (5) is not upcoming.
    CricketStatsJob.classify(today.plusDays(5), today.plusDays(7)) shouldBe MatchType.Future
  }

  it should "mark a match starting well beyond the upcoming window as Future" in {
    CricketStatsJob.classify(today.plusDays(30), today.plusDays(32)) shouldBe MatchType.Future
  }

  it should "mark a match that ended yesterday as Historical" in {
    CricketStatsJob.classify(today.minusDays(3), today.minusDays(1)) shouldBe MatchType.Historical
  }

  it should "mark a match that finished well in the past as Historical" in {
    CricketStatsJob.classify(today.minusDays(30), today.minusDays(28)) shouldBe MatchType.Historical
  }

}

object CricketStatsJobTest extends MockitoSugar {
  private val today = LocalDate.now
  private val england: CricketTeam = CricketTeams.teams.head

  private val future = CompetitionMatch("upcoming", "c", "Comp", today.plusDays(10), today.plusDays(12))
  private val upcoming = CompetitionMatch("upcoming", "c", "Comp", today.plusDays(2), today.plusDays(4))
  private val active = CompetitionMatch("active", "c", "Comp", today, today.plusDays(3))
  private val historical = CompetitionMatch("historical", "c", "Comp", today.minusDays(30), today.minusDays(28))

  // More than one batch's worth of historical matches, each on a distinct date so they occupy
  // distinct cache slots.
  private val manyHistorical: Seq[CompetitionMatch] =
    (1 to 15).map(i => CompetitionMatch(s"h$i", "c", "Comp", today.minusDays(30L + i), today.minusDays(28L + i)))

  // Run all Future callbacks inline so assertions can follow synchronously.
  private implicit val sameThread: ExecutionContext = new ExecutionContext {
    def execute(runnable: Runnable): Unit = runnable.run()
    def reportFailure(cause: Throwable): Unit = throw cause
  }

  private def aMatch(matchId: String, gameDate: LocalDateTime): Match =
    Match(
      teams = List(Team("Home", "h", home = true, Nil, None), Team("Away", "a", home = false, Nil, None)),
      innings = Nil,
      competitionName = "Comp",
      stage = "",
      venueName = "",
      result = "",
      currentDay = 0,
      totalDays = 0,
      gameDate = gameDate,
      officials = Nil,
      matchId = matchId,
    )

  private def stubbedFeed(team: CricketTeam, matches: Seq[CompetitionMatch]): PaFeed = {
    val paFeed = mock[PaFeed]
    when(paFeed.getCompetitionMatches(any[CricketTeam], any[LocalDate])(any())).thenReturn(Future.successful(Nil))
    when(paFeed.getCompetitionMatches(eqTo(team), any[LocalDate])(any())).thenReturn(Future.successful(matches))
    matches.foreach { cm =>
      when(paFeed.getMatch(eqTo(cm))(any()))
        .thenReturn(Future.successful(aMatch(cm.matchId, cm.startDate.atStartOfDay)))
    }
    paFeed
  }
}
