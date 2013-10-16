package applications

import org.scalatest.FlatSpec
import org.scalatest.matchers.ShouldMatchers
import common.{Grunt, Server}

class ApplicationsTest extends FlatSpec with ShouldMatchers {

  "Applications" should "pass integration tests" in Server {
    Grunt("applications") should be (0)
  }

}
