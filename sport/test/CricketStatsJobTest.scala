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

  "classify" should "treat a match starting in more than 5 days as Upcoming" in {
    CricketStatsJob.classify(today.plusDays(6)) shouldBe MatchType.Upcoming
  }

  it should "treat a match starting exactly 5 days ahead as Active" in {
    CricketStatsJob.classify(today.plusDays(5)) shouldBe MatchType.Active
  }

  it should "treat today's match as Active" in {
    CricketStatsJob.classify(today) shouldBe MatchType.Active
  }

  it should "treat a match 6 days after it start as still Active (boundary)" in {
    CricketStatsJob.classify(today.minusDays(6)) shouldBe MatchType.Active
  }

  it should "treat a match started more than 6 days ago as Historical" in {
    CricketStatsJob.classify(today.minusDays(7)) shouldBe MatchType.Historical
  }

  "backfillMatches" should "load an unfetched match" in {
    val paFeed = stubbedFeed(england, Seq(historical))
    val job = new CricketStatsJob(paFeed)

    job.discoverMatches(fromDate = today.minusMonths(2), toDate = today.plusMonths(2))
    job.backfillMatches()

    verify(paFeed).getMatch(eqTo(historical))(any())
  }

  it should "load active matches during the initial backfill" in {
    val paFeed = stubbedFeed(england, Seq(active))
    val job = new CricketStatsJob(paFeed)

    job.discoverMatches(fromDate = today.minusMonths(2), toDate = today.plusMonths(2))
    job.backfillMatches()

    verify(paFeed).getMatch(eqTo(active))(any())
  }

  it should "backfill no more than the per-cycle batch size, deferring the rest to later cycles" in {
    val paFeed = stubbedFeed(england, manyHistorical)
    val job = new CricketStatsJob(paFeed)

    job.discoverMatches(fromDate = today.minusMonths(2), toDate = today.plusMonths(2))

    job.backfillMatches()
    verify(paFeed, times(CricketStatsJob.matchesPerCycle)).getMatch(any[CompetitionMatch])(any())

    clearInvocations(paFeed)
    job.backfillMatches()
    verify(paFeed, times(manyHistorical.size - CricketStatsJob.matchesPerCycle))
      .getMatch(any[CompetitionMatch])(any())
  }

  it should "not refresh active or upcoming matches until backfill is complete" in {
    val paFeed = stubbedFeed(england, Seq(active, historical))
    val job = new CricketStatsJob(paFeed)

    job.discoverMatches(fromDate = today.minusMonths(2), toDate = today.plusMonths(2))
    job.backfillMatches() // backfills both active and historical
    clearInvocations(paFeed)
    job.refreshActiveMatchData()
    job.refreshUpcomingMatchData()

    verify(paFeed).getMatch(eqTo(active))(any())
    verify(paFeed, never).getMatch(eqTo(historical))(any())
  }

  it should "refresh upcoming and active matches once backfill is complete" in {
    val paFeed = stubbedFeed(england, Seq(active, upcoming))
    val job = new CricketStatsJob(paFeed)

    job.discoverMatches(fromDate = today.minusMonths(2), toDate = today.plusMonths(2))
    job.backfillMatches() // backfills both active and historical
    clearInvocations(paFeed)
    job.refreshUpcomingMatchData()

    verify(paFeed).getMatch(eqTo(upcoming))(any())
    verify(paFeed, times(1)).getMatch(any[CompetitionMatch])(any())

    clearInvocations(paFeed)
    job.refreshActiveMatchData()
    verify(paFeed).getMatch(eqTo(active))(any())
    verify(paFeed, times(1)).getMatch(any[CompetitionMatch])(any())
  }
}

object CricketStatsJobTest extends MockitoSugar {
  private val today = LocalDateTime.now
  private val england: CricketTeam = CricketTeams.teams.head

  private val upcoming = CompetitionMatch("upcoming", "c", "Comp", today.plusDays(10))
  private val active = CompetitionMatch("active", "c", "Comp", today.plusDays(1))
  private val historical = CompetitionMatch("historical", "c", "Comp", today.minusDays(30))

  // More than one batch's worth of historical matches, each on a distinct date so they occupy
  // distinct cache slots.
  private val manyHistorical: Seq[CompetitionMatch] =
    (1 to 15).map(i => CompetitionMatch(s"h$i", "c", "Comp", today.minusDays(30L + i)))

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
        .thenReturn(Future.successful(aMatch(cm.matchId, cm.startDate.toLocalDate.atStartOfDay)))
    }
    paFeed
  }
}
