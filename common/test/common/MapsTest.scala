package common

import org.scalatest.matchers.should.Matchers
import Maps._
import org.scalatest.flatspec.AnyFlatSpec

class MapsTest extends AnyFlatSpec with Matchers {
  "insertWith" should "just insert v if k is not present in map" in {
    insertWith(Map.empty[String, Int], "a", 3)(_ + _) shouldEqual Map("a" -> 3)
  }

  it should "resolve collisions with f if k is present in map" in {
    insertWith(Map("a" -> 1), "a", 3)(_ + _) shouldEqual Map("a" -> 4)
  }
}
