package football.implicits

import test.FootballTestData.{fixture, liveMatch, result}
import org.scalatest.featurespec.AnyFeatureSpec
import org.scalatest.matchers.should.Matchers
import org.scalatest.GivenWhenThen
import java.time.{ZoneId, ZonedDateTime}

class FootballTest extends AnyFeatureSpec with GivenWhenThen with Matchers with implicits.Football {
  private val zone = ZoneId.of("Europe/London")
  private val today = ZonedDateTime.now().withZoneSameInstant(zone)

  Feature("FootballMatch") {

    Scenario("isOn returns false if match date is before the given date") {

      Given("a match which happened yesterday")
      val yesterdayMatch =
        result("Aston Villa", "Cardiff", 1, 0, today.minusDays(1), None)

      Then("calling isOn with today's date should return false")
      val isMatchOnToday = yesterdayMatch.isOn(today.toLocalDate)
      isMatchOnToday shouldBe (false)
    }

    Scenario("isOn returns false if match date is after the given date") {

      Given("a match which will happen tomorrow")
      val tomorrowMatch =
        fixture("Aston Villa", "Cardiff", today.plusDays(1))

      Then("calling isOn with today's date should return false")
      val isMatchOnToday = tomorrowMatch.isOn(today.toLocalDate)
      isMatchOnToday shouldBe (false)
    }

    Scenario("isOn returns true if match date is same as the given date") {

      Given("a match which happens today")
      val todayMatch =
        liveMatch("Aston Villa", "Cardiff", 1, 0, today, isLive = true)

      Then("calling isOn with today's date should return true")
      val isMatchOnToday = todayMatch.isOn(today.toLocalDate)
      isMatchOnToday shouldBe (true)
    }

    Scenario("isAboutToStart returns true if match start time is within the next 5 minutes") {

      Given("a match which happens in 5 minutes")
      val fiveMinutesFromNow = ZonedDateTime.now().plusMinutes(5)
      val theMatch =
        liveMatch("Aston Villa", "Cardiff", 1, 0, fiveMinutesFromNow, isLive = true)

      Then("calling isAboutToStart should return true")
      theMatch.isAboutToStart shouldBe (true)
    }

    Scenario("isAboutToStart returns false if match start time is more than 5 minutes from now") {

      Given("a match starting in more than 5 minutes")
      val fiveMinutesFromNow = ZonedDateTime.now().plusMinutes(5).plusSeconds(1)
      val theMatch =
        liveMatch("Aston Villa", "Cardiff", 1, 0, fiveMinutesFromNow, isLive = true)

      Then("calling isAboutToStart should return fals")
      theMatch.isAboutToStart shouldBe (false)
    }
  }
}
