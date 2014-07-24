package conf

import org.scalatest.{Suites, BeforeAndAfter, Matchers, FlatSpec}
import test.Fake

class StaticTests extends Suites (
  new StaticTestOff,
  new StaticTestOn
)

class StaticTestOff extends FlatSpec with Matchers with BeforeAndAfter {
  def test() {
    val unescapedCramPath = "../cram/js"

    before {
      Switches.SeoBlockGooglebotFromJSPathsSwitch.switchOff()
    }

    Switches.SeoBlockGooglebotFromJSPathsSwitch.switchOff()

    "Static js curl" should "have unescaped paths that googlebot can follow when SeoBlockGooglebotFromJSPathsSwitch is OFF" in Fake {
      Static.js.curl should contain(unescapedCramPath)
    }
  }
}

class StaticTestOn extends FlatSpec with Matchers with BeforeAndAfter {
  def test() {
    val escapedCramPath = "\"..\" + \"/\" + \"cram/js\""

    before {
      Switches.SeoBlockGooglebotFromJSPathsSwitch.switchOn()
    }

    "Static js curl" should "have escaped script paths that googlebot will ignore when SeoBlockGooglebotFromJSPathsSwitch is ON" in Fake {
      Static.js.curl should contain(escapedCramPath)
    }
  }
}


