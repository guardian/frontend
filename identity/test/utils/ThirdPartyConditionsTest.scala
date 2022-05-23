package utils

import ThirdPartyConditions._
import org.scalatest.funsuite.AnyFunSuite
import org.scalatest.matchers.should.Matchers

class ThirdPartyConditionsTest extends AnyFunSuite with Matchers {

  test("validation of group code returns Some for a valid group code") {
    val thirdPartyConditions = List("GRS")
    validGroupCode(thirdPartyConditions, Some("GRS")) should equal(Some("GRS"))
  }

  test("validation of group code returns None for a valid group code") {
    val thirdPartyConditions = List("GRS")
    validGroupCode(thirdPartyConditions, Some("GHO")) should equal(None)
  }

}
