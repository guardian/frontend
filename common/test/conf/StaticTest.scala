package conf

import org.scalatest.{Matchers, FlatSpec}
import test.Fake

class StaticTest extends FlatSpec with Matchers {

  "Static" should "escape javascript paths in .js.curl" in Fake{

    Static.js.curl should include ("[\"..\" + \"/\" + \"domReady\"]")
  }

}



