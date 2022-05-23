package common

import common.Strings./
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

class StringsTest extends AnyFlatSpec with Matchers {
  "/.unapply" should "return None if the string does not contain a slash" in {
    /.unapply("Hello") shouldEqual None
  }

  it should "return a Some of the tuple of the strings preceding and after the first slash otherwise" in {
    /.unapply("one/two/three") shouldEqual Some(("one", "two/three"))
  }
}
