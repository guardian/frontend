package applications

import org.scalatest.FlatSpec
import org.scalatest.Matchers
import common.{Grunt, Server}

class ApplicationsTest extends FlatSpec with Matchers {

  "Applications" should "pass integration tests" in Server {
    Grunt("applications") should be (0)
  }

}
