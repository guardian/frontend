package conf.switches

import org.joda.time.{DateTimeConstants, LocalDate}
import org.scalatest.FlatSpec
import org.scalatest.Matchers

class SwitchesTest extends FlatSpec with Matchers {

  val SwitchNamePattern = """([a-z\d-]+)""".r

  "Switches" should "have names consisting only of lowercase letters, numbers and hyphens" in {
    Switches.all.map(_.name).foreach{
      case SwitchNamePattern(_) => Unit
      case badName => fail("'" + badName + "' is not a good switch name, it may only consist of lowercase letters, numbers and hyphens")
    }
  }

  they should "have a description" in {
    Switches.all foreach { _.description.trim should not be("") }
  }

  // If you are wondering why this test has failed then read, https://github.com/guardian/frontend/pull/2711
  they should "be deleted once expired" in {
    Switches.all foreach { switch =>
      assert(switch.sellByDate.isAfter(LocalDate.now()), switch.name)
    }
  }

  they should "have weekday expiry dates" in {
    Switches.all foreach { switch =>
     val day = switch.sellByDate.getDayOfWeek()
     val isWeekend = day == DateTimeConstants.SATURDAY || day == DateTimeConstants.SUNDAY
     assert(!isWeekend, switch.name)
    }
  }
}
