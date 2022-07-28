package common

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

class BoxSpec extends AnyFlatSpec with Matchers {
  "Box" should "return the initial value" in {
    val box = Box(5)
    box() should be(5)
  }

  "Box" should "return the updated" in {
    val box = Box(5)
    box.send(2)
    box() should be(2)
  }
}
