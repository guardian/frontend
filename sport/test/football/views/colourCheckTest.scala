package football.views

import org.scalatest.{ShouldMatchers, FunSuite}
import views.colourCheck

class colourCheckTest extends FunSuite with ShouldMatchers {
  test("Whtie should be a light colour") {
    colourCheck.isLight("ffffff") should equal(true)
  }

  test("black should be a dark colour") {
    colourCheck.isLight("000000") should equal(false)
  }

  test("Marginal colours should be correctly identified") {
    colourCheck.isLight("333333") should equal(false)
    colourCheck.isLight("00ccff") should equal(true)
    colourCheck.isLight("ff00ff") should equal(false)
  }

  test("drops the leading # if present") {
    colourCheck.isLight("#ffffff") should equal(true)
  }
}
