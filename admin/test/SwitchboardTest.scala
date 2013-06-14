import controllers.{Switch, SwitchboardController}
import org.scalatest.FlatSpec
import org.scalatest.matchers.ShouldMatchers

class SwitchboardTest extends FlatSpec with ShouldMatchers {

  val SwitchNamePattern = """([a-z\d-]+)""".r

  "Switches" should "have names consisting only of lowercase letters, numbers and hyphens" in {
    SwitchboardController.switches.map(_.name).foreach{
      case SwitchNamePattern(_) => Unit
      case badName => fail("'" + badName + "' is not a good switch name, it may only consist of lowercase letters, numbers and hyphens")
    }
  }

  they should "have a description" in {
    SwitchboardController.switches.foreach{
      case Switch(name, _, desc) => desc.trim should not be("")
    }
  }
}
