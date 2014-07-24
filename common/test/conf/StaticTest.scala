package conf

import org.scalatest.{Matchers, FlatSpec}
import test.Fake

class StaticTest extends FlatSpec with Matchers {

  "Static" should "not escape paths if switched off" in Fake {

    Switches.SeoBlockGooglebotFromJSPathsSwitch.switchOff()

    Static.js.curl should include ("[\"../domReady\"]")
  }

  it should "escape paths if switched on" in Fake{

    Switches.SeoBlockGooglebotFromJSPathsSwitch.switchOn()

    Static.js.curl should include ("[\"..\" + \"/\" + \"domReady\"]")
  }

}



