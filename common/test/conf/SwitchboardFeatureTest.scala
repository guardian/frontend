package conf

import org.scalatest.{ GivenWhenThen, FeatureSpec }
import org.scalatest.matchers.ShouldMatchers
import com.gu.management.DefaultSwitch
import common.GuardianConfiguration

class SwitchboardFeatureTest extends FeatureSpec with ShouldMatchers with GivenWhenThen {

  feature("Switchboard") {

    scenario("load switch values from config") {

      given("I have configured switches")

      val switches = Seq(
        new DefaultSwitch("switch-a", "Switch A", initiallyOn = true),
        new DefaultSwitch("switch-b", "Switch B", initiallyOn = false),
        new DefaultSwitch("switch-c", "Switch C", initiallyOn = true)
      )

      val switchboard = new SwitchBoardAgent(new GuardianConfiguration("test"), switches)

      when("I refresh the switchboard")
      switchboard.refresh()

      then("The switches should be set to the correct value")
      switches.find(_.name == "switch-a").get.isSwitchedOn should be(true)
      switches.find(_.name == "switch-b").get.isSwitchedOn should be(false)

      and("Non configured switches should be unchanged")
      switches.find(_.name == "switch-c").get.isSwitchedOn should be(true)
    }
  }
}
