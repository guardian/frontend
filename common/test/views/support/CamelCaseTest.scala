package views.support

import CamelCase.fromHyphenated
import org.scalatest.{Matchers, FlatSpec}

class CamelCaseTest extends FlatSpec with Matchers {
  "fromHyphenated" should "create a camel case string" in {
    fromHyphenated("once-upon-a-time") shouldEqual "onceUponATime"
    fromHyphenated("hello-world") shouldEqual "helloWorld"
    fromHyphenated("monad") shouldEqual "monad"
    fromHyphenated("") shouldEqual ""
  }
}
