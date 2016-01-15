package conf.switches

import org.joda.time.{DateTimeConstants, LocalDate}
import org.scalatest.concurrent.ScalaFutures._
import org.scalatest.{AppendedClues, FlatSpec, Matchers}

class SwitchesTest extends FlatSpec with Matchers with AppendedClues {

  private val SwitchNamePattern = """([a-z\d-]+)""".r

  private def forAllSwitches(test: Switch => Unit): Unit = {
    whenReady(Switches.eventuallyAll)(_ foreach { switch => test(switch) withClue s"(switch: '${switch.name}')" })
  }

  "Switches" should "have names consisting only of lowercase letters, numbers and hyphens" in {
    forAllSwitches(_.name should fullyMatch regex SwitchNamePattern)
  }

  they should "have a description" in {
    forAllSwitches(_.description.trim should not be empty)
  }

  // If you are wondering why this test has failed then read, https://github.com/guardian/frontend/pull/2711
  they should "be deleted once expired" in {
    forAllSwitches(_.hasExpired shouldBe false)
  }

  they should "have weekday expiry dates" in {
    def isWeekend(date: LocalDate) = {
      val day = date.getDayOfWeek
      day == DateTimeConstants.SATURDAY || day == DateTimeConstants.SUNDAY
    }
    forAllSwitches(switch => isWeekend(switch.sellByDate) shouldBe false)
  }
}
