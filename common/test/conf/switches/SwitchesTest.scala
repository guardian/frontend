package conf.switches

import org.joda.time.{DateTimeConstants, LocalDate}
import org.scalatest.concurrent.ScalaFutures._
import org.scalatest.{AppendedClues, FlatSpec, Matchers}

class SwitchesTest extends FlatSpec with Matchers with AppendedClues {

  private val SwitchNamePattern = """([a-z\d-]+)""".r

  private def forAllSwitches(test: Switch => Unit): Unit = {
    whenReady(Switches.eventuallyAll)(_ foreach { switch => test(switch) withClue s"(switch: '${switch.name}')" })
  }

  def testSwitch = Switch(
    "category",
    "test-switch",
    "exciting switch",
    safeState = Off,
    sellByDate = new LocalDate(2018, 2, 1),
    exposeClientSide = true
  )

  def foreverSwitch = Switch(
    "category",
    "switch-name",
    "exciting switch",
    safeState = Off,
    sellByDate = None,
    exposeClientSide = true
  )

  "Switches" should "not be near expiry over a week in advance" in {
    Switch.expiry(testSwitch, new LocalDate(2018, 1, 24)) should be(Switch.Expiry(Some(8), false, false))
  }

  "Switches" should "be near expiry a week ahead of the last day" in {
    Switch.expiry(testSwitch, new LocalDate(2018, 1, 25)) should be(Switch.Expiry(Some(7), true, false))
  }

  "Switches" should "still be good on their sell by date" in {
    Switch.expiry(testSwitch, new LocalDate(2018, 2, 1)) should be(Switch.Expiry(Some(0), true, false))
  }

  they should "be bad after their sell by date" in {
    Switch.expiry(testSwitch, new LocalDate(2018, 2, 2)) should be(Switch.Expiry(Some(-1), true, true))
  }

  they should "never expire if they don't have an expiry" in {
    Switch.expiry(foreverSwitch, new LocalDate(2016, 2, 2)) should be(Switch.Expiry(None, false, false))
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

  they should "have weekday expiry dates" in {
    def isWeekend(date: LocalDate) = {
      val day = date.getDayOfWeek
      day == DateTimeConstants.SATURDAY || day == DateTimeConstants.SUNDAY
    }
    forAllSwitches(switch => switch.sellByDate.exists(isWeekend) shouldBe false)
  }
}
