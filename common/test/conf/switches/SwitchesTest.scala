package conf.switches

import org.scalatest.flatspec.AnyFlatSpec

import java.time.DayOfWeek.{SATURDAY, SUNDAY}
import java.time.LocalDate
import org.scalatest.AppendedClues
import org.scalatest.matchers.should.Matchers

class SwitchesTest extends AnyFlatSpec with Matchers with AppendedClues {

  private val SwitchNamePattern = """([a-z\d-]+)""".r

  private val abSwitchNamePattern = """ab-([a-z\d-]+)""".r

  private def forAllSwitches(test: Switch => Unit, switches: Iterable[Switch] = Switches.all): Unit = {
    switches foreach { switch => test(switch) withClue s"(switch: '${switch.name}')" }
  }

  private def forAllABTestSwitches(test: Switch => Unit): Unit = {
    Switches.grouped.find(_._1.name == "A/B Tests") foreach {
      case (_, switches) => forAllSwitches(test, switches)
    }
  }

  private val testSwitchGroup = new SwitchGroup("category")

  private val switchExpiryDate = {
    val today = LocalDate.now()
    if (today.getDayOfWeek == SATURDAY) today.plusDays(2)
    else if (today.getDayOfWeek == SUNDAY) today.plusDays(1)
    else today
  }

  def testSwitch: Switch =
    Switch(
      testSwitchGroup,
      "test-switch",
      "exciting switch",
      owners = Seq(Owner.withGithub("FakeOwner")),
      safeState = Off,
      sellByDate = Some(switchExpiryDate),
      exposeClientSide = true,
    )

  def foreverSwitch: Switch =
    Switch(
      testSwitchGroup,
      "forever-switch",
      "exciting switch",
      owners = Seq(Owner.withGithub("FakeOwner")),
      safeState = Off,
      sellByDate = None,
      exposeClientSide = true,
    )

  "Switches" should "not be near expiry over a week in advance" in {
    Switch.expiry(testSwitch, switchExpiryDate.minusDays(9)) should be(Switch.Expiry(Some(9), false, false))
  }

  "Switches" should "be near expiry a week ahead of the last day" in {
    Switch.expiry(testSwitch, switchExpiryDate.minusDays(7)) should be(Switch.Expiry(Some(7), true, false))
  }

  "Switches" should "still be good on their sell by date" in {
    Switch.expiry(testSwitch, switchExpiryDate) should be(Switch.Expiry(Some(0), true, false))
  }

  they should "be bad after their sell by date" in {
    Switch.expiry(testSwitch, switchExpiryDate.plusDays(1)) should be(Switch.Expiry(Some(-1), true, true))
  }

  they should "never expire if they don't have an expiry" in {
    Switch.expiry(foreverSwitch, switchExpiryDate) should be(Switch.Expiry(None, false, false))
  }

  "Switches" should "have names consisting only of lowercase letters, numbers and hyphens" in {
    forAllSwitches(_.name should fullyMatch regex SwitchNamePattern)
  }

  they should "have a description" in {
    forAllSwitches(_.description.trim should not be empty)
  }

  // If you are wondering why this test has failed then read, https://github.com/guardian/frontend/pull/2711
  they should "be deleted once expired" in {
    forAllSwitches(Switch.expiry(_).hasExpired shouldBe false)
  }

  they should "all have at least one owner" in {
    forAllSwitches(_.owners.nonEmpty shouldBe true)
  }

  they should "have weekday expiry dates" in {
    def isWeekend(date: LocalDate): Boolean = {
      val day = date.getDayOfWeek
      day == SATURDAY || day == SUNDAY
    }
    forAllSwitches(switch => switch.sellByDate.exists(isWeekend) shouldBe false)
  }

  "AB test switches" should "begin with ab-" in {
    forAllABTestSwitches(switch => switch.name should fullyMatch regex abSwitchNamePattern)
  }
}
