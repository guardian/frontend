package test

import controllers.PuzzlesAccessPolicy
import org.scalatest.DoNotDiscover
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

import java.time.LocalDate

@DoNotDiscover class PuzzlesAccessPolicyTest extends AnyFlatSpec with Matchers {

  private val today = LocalDate.of(2026, 11, 9)

  "requiresSubscription" should "keep today's puzzle free" in {
    PuzzlesAccessPolicy.requiresSubscription(today, today) should be(false)
  }

  it should "keep the last seven days, counting today, free" in {
    PuzzlesAccessPolicy.requiresSubscription(today.minusDays(1), today) should be(false)
    // 3 November is the oldest free puzzle on 9 November
    PuzzlesAccessPolicy.requiresSubscription(today.minusDays(6), today) should be(false)
  }

  it should "require a subscription from the eighth day, counting today" in {
    // 2 November is already premium on 9 November
    PuzzlesAccessPolicy.requiresSubscription(today.minusDays(7), today) should be(true)
    PuzzlesAccessPolicy.requiresSubscription(today.minusDays(8), today) should be(true)
    PuzzlesAccessPolicy.requiresSubscription(today.minusYears(2), today) should be(true)
  }

  it should "keep future puzzles free" in {
    PuzzlesAccessPolicy.requiresSubscription(today.plusDays(1), today) should be(false)
  }

  "requiresSubscriptionAt" should "read the epoch milliseconds as a UTC date" in {
    def millis(date: LocalDate) = date.atStartOfDay(java.time.ZoneOffset.UTC).toInstant.toEpochMilli
    PuzzlesAccessPolicy.requiresSubscriptionAt(millis(today.minusDays(6)), today) should be(false)
    PuzzlesAccessPolicy.requiresSubscriptionAt(millis(today.minusDays(7)), today) should be(true)
    PuzzlesAccessPolicy.requiresSubscriptionAt(millis(today.plusDays(1)), today) should be(false)
  }

  it should "treat a date it cannot read as free" in {
    PuzzlesAccessPolicy.requiresSubscriptionAt(Long.MaxValue, today) should be(false)
  }
}
