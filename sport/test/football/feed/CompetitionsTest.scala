package football.feed

import java.time.{Clock, Duration, ZoneId, ZonedDateTime}

import feed.Competitions
import org.scalatest._
import pa.FootballMatch
import test.FootballTestData.{competitions, result, liveMatch, fixture}

case class TestCase(isLive: Boolean, startTimeDelta: Duration, expectedStatus: Boolean)

class CompetitionsTest extends FreeSpec with Matchers with OptionValues {
  "Competitions" - {
    Seq(
      TestCase(false, Duration.ofSeconds(1), true),
      TestCase(false, Duration.ofMinutes(1), true),
      TestCase(false, Duration.ofMinutes(14).plusSeconds(59), true),
      TestCase(false, Duration.ofMinutes(15), false),
      TestCase(false, Duration.ofMinutes(16), false),
      TestCase(true, Duration.ofMinutes(16), true),
      TestCase(true, Duration.ofMinutes(20), true),
    ) foreach { testcase =>
      (s"isMatchLiveOrAboutToStart returns ${testcase.expectedStatus} if there's a match that started ${testcase.startTimeDelta} ago") in {
        val matches: Seq[FootballMatch] =
          Seq(
            result("Bolton", "Derby", 1, 1, today.minusDays(1), Some("Bolton win 4-2 on penalties.")),
            liveMatch("Cardiff", "Brighton", 2, 0, today.minus(testcase.startTimeDelta), testcase.isLive),
            fixture("Wolves", "Burnley", today.plusDays(2)),
          )

        val testCompetition = competitions(1).copy(matches = matches)
        val competitionsList = Competitions(Seq(testCompetition))

        val actualResult = competitionsList.isMatchLiveOrAboutToStart(competitionsList.matches, clock)

        actualResult should equal(testcase.expectedStatus)
      }
    }

    Seq(
      TestCase(false, Duration.ofSeconds(1), true),
      TestCase(false, Duration.ofMinutes(1), true),
      TestCase(false, Duration.ofMinutes(4).plusSeconds(59), true),
      TestCase(false, Duration.ofMinutes(5), false),
      TestCase(false, Duration.ofMinutes(10), false),
      TestCase(true, Duration.ofMinutes(5), true),
      TestCase(true, Duration.ofMinutes(10), true),
    ) foreach { testcase =>
      (s"isMatchLiveOrAboutToStart returns ${testcase.expectedStatus} if there's a match with liveMatch status ${testcase.isLive} that will start in ${testcase.startTimeDelta}") in {
        val matches: Seq[FootballMatch] =
          Seq(
            result("Bolton", "Derby", 1, 1, today.minusDays(1), Some("Bolton win 4-2 on penalties.")),
            liveMatch("Cardiff", "Brighton", 2, 0, today.plus(testcase.startTimeDelta), testcase.isLive),
            fixture("Wolves", "Burnley", today.plusDays(2)),
          )
        val testCompetition = competitions(1).copy(matches = matches)
        val competitionsList = Competitions(Seq(testCompetition))

        val actualResult = competitionsList.isMatchLiveOrAboutToStart(competitionsList.matches, clock)

        actualResult should equal(testcase.expectedStatus)
      }
    }
  }

  private val zone = ZoneId.of("Europe/London")

  private val today = ZonedDateTime.now().withZoneSameInstant(zone)

  private val clock = {
    val fixedDate = today.toInstant
    Clock.fixed(fixedDate, zone)
  }
}
