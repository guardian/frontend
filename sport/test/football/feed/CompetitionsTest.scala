package football.feed

import java.time.{Clock, Duration, ZoneId, ZonedDateTime}

import feed.Competitions
import org.scalatest._
import pa.FootballMatch
import test.FootballTestData.{competitions, result, liveMatch, fixture}

class CompetitionsTest extends FreeSpec with Matchers with OptionValues {
  "Competitions" - {
    Seq(
      (false, Duration.ofSeconds(1), true),
      (false, Duration.ofMinutes(1), true),
      (false, Duration.ofMinutes(14).plusSeconds(59), true),
      (false, Duration.ofMinutes(15), false),
      (false, Duration.ofMinutes(16), false),
      (true, Duration.ofMinutes(16), true),
      (true, Duration.ofMinutes(20), true),
    ) foreach { testcase =>
      (s"isMatchLiveOrAboutToStart returns ${testcase._3} if there's a match that started ${testcase._2} ago") in {
        val matches: Seq[FootballMatch] =
          matchesWithLiveMatchAtCurrentMinusDuration(testcase._2, testcase._1)

        val testCompetition = competitions(1).copy(matches = matches)
        val competitionsList = Competitions(Seq(testCompetition))

        val isMatchLiveOrAboutToStart = competitionsList.isMatchLiveOrAboutToStart(competitionsList.matches, clock)

        isMatchLiveOrAboutToStart should equal(testcase._3)
      }
    }

    Seq(
      (false, Duration.ofSeconds(1), true),
      (false, Duration.ofMinutes(1), true),
      (false, Duration.ofMinutes(4).plusSeconds(59), true),
      (false, Duration.ofMinutes(5), false),
      (false, Duration.ofMinutes(10), false),
      (true, Duration.ofMinutes(5), true),
      (true, Duration.ofMinutes(10), true),
    ) foreach { testcase =>
      (s"isMatchLiveOrAboutToStart returns ${testcase._3} if there's a match with liveMatch status ${testcase._1} that will start in ${testcase._2}") in {
        val matches: Seq[FootballMatch] =
          matchesWithLiveMatchAtCurrentPlusDuration(testcase._2, testcase._1)
        val testCompetition = competitions(1).copy(matches = matches)
        val competitionsList = Competitions(Seq(testCompetition))
        val isMatchLiveOrAboutToStart = competitionsList.isMatchLiveOrAboutToStart(competitionsList.matches, clock)

        isMatchLiveOrAboutToStart should equal(testcase._3)
      }
    }
  }

  private val zone = ZoneId.of("Europe/London")

  private val today = ZonedDateTime.now().withZoneSameInstant(zone)

  private val clock = {
    val fixedDate = today.toInstant
    Clock.fixed(fixedDate, zone)
  }

  def matchesWithLiveMatchAtCurrentMinusDuration(duration: Duration, liveMatchStatus: Boolean = false) = {
    Seq(
      result("Bolton", "Derby", 1, 1, today.minusDays(1), Some("Bolton win 4-2 on penalties.")),
      liveMatch("Cardiff", "Brighton", 2, 0, today.minus(duration), liveMatchStatus),
      fixture("Wolves", "Burnley", today.plusDays(2)),
    )
  }

  def matchesWithLiveMatchAtCurrentPlusDuration(duration: Duration, liveMatchStatus: Boolean = false) = {
    Seq(
      result("Bolton", "Derby", 1, 1, today.minusDays(1), Some("Bolton win 4-2 on penalties.")),
      liveMatch("Cardiff", "Brighton", 2, 0, today.plus(duration), liveMatchStatus),
      fixture("Wolves", "Burnley", today.plusDays(2)),
    )
  }

}
