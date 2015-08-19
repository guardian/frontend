package utils

import org.scalatest.{FunSuite, Matchers}
import ThirdPartyConditions._

class ThirdPartyConditionsTest extends FunSuite with Matchers {

  test("validation of group code returns Some for a valid group code") {
    val thirdPartyConditions = List("GRS")
    validGroupCode(thirdPartyConditions, Some("GRS"))should equal(Some("GRS"))
  }

  test("validation of group code returns None for a valid group code") {
    val thirdPartyConditions = List("GRS")
    validGroupCode(thirdPartyConditions, Some("GHO")) should equal(None)
  }

}
