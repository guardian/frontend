package utils

import org.scalatest.{FlatSpec, Matchers}

class UnsafeContentTest extends FlatSpec with Matchers {

  "Unsafe content" should "return false if vid.me URL not found" in {
    val input = "Some content with vid..me in it."
    val got = UnsafeContent.isVidme(input)
    got shouldBe false
  }

  "Unsafe content" should "return true if vid.me URL found" in {
    val input = "Some content with vid.me in it."
    val got = UnsafeContent.isVidme(input)
    got shouldBe true
  }
}
