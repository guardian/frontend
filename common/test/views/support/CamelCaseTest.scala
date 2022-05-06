package views.support

import CamelCase.fromHyphenated
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

class CamelCaseTest extends AnyFlatSpec with Matchers {
  "fromHyphenated" should "create a camel case string" in {
    fromHyphenated("once-upon-a-time") shouldEqual "onceUponATime"
    fromHyphenated("hello-world") shouldEqual "helloWorld"
    fromHyphenated("monad") shouldEqual "monad"
    fromHyphenated("") shouldEqual ""
  }
}
