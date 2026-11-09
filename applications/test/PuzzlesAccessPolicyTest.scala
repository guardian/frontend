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

  it should "keep puzzles up to seven days old free" in {
    PuzzlesAccessPolicy.requiresSubscription(today.minusDays(1), today) should be(false)
    PuzzlesAccessPolicy.requiresSubscription(today.minusDays(7), today) should be(false)
  }

  it should "require a subscription from eight days old" in {
    PuzzlesAccessPolicy.requiresSubscription(today.minusDays(8), today) should be(true)
    PuzzlesAccessPolicy.requiresSubscription(today.minusYears(2), today) should be(true)
  }

  it should "keep future puzzles free" in {
    PuzzlesAccessPolicy.requiresSubscription(today.plusDays(1), today) should be(false)
  }
}
