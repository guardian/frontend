package dev

import org.scalatest._
import test.Fake

class HttpSwitchParametersTest extends FlatSpec with Matchers with HttpSwitchHelper {

  "onSwitches" should "detect the correct query parameter" in Fake {
    httpSwitchInNonProd.onSwitches(requestWithSwitchesOn) should be(Some("switch1,switch2"))
    httpSwitchInNonProd.offSwitches(requestWithSwitchesOn) should be(None)
  }

  "offSwitches" should "detect the correct query parameter" in Fake {
    httpSwitchInNonProd.offSwitches(requestWithSwitchesOff) should be(Some("switch2,switch3"))
    httpSwitchInNonProd.onSwitches(requestWithSwitchesOff) should be(None)
  }

  "queryString" should "not leave URL unchanged if environment is PROD" in Fake {
    val url = httpSwitchInProd.queryString("/bla/bla?page=1")(requestWithSwitchesOnAndOff)

    url should not include "switchesOn"
    url should not include "switchesOff"
  }

  "queryString" should "not append anything if no switches overrides present" in Fake {
    val url = httpSwitchInNonProd.queryString("/bla/bla")(requestWithNoSwitches)

    url should not include "?"
  }

  "queryString" should "append ON/OFF switches overrides if present" in Fake {
    httpSwitchInNonProd.queryString("/bla/bla")(requestWithSwitchesOn) should endWith("?switchesOn=switch1,switch2")
    httpSwitchInNonProd.queryString("/bla/bla")(requestWithSwitchesOff) should endWith("?switchesOff=switch2,switch3")
    httpSwitchInNonProd.queryString("/bla/bla")(requestWithSwitchesOnAndOff) should endWith("?switchesOn=switch1,switch2&switchesOff=switch2,switch3")

    httpSwitchInNonProd.queryString("/bla/bla?page=1")(requestWithSwitchesOff) should endWith("?page=1&switchesOff=switch2,switch3")
    httpSwitchInNonProd.queryString("/bla/bla?index=3")(requestWithSwitchesOff) should endWith("?index=3&switchesOff=switch2,switch3")
  }

}
