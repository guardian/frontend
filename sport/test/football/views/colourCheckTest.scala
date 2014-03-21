package football.views

import org.scalatest.{ShouldMatchers, FunSuite}
import views.ColourTools

class colourCheckTest extends FunSuite with ShouldMatchers {
  test("Whtie should be a light colour") {
    ColourTools.isLight("ffffff") should equal(true)
  }

  test("black should be a dark colour") {
    ColourTools.isLight("000000") should equal(false)
  }

  test("Marginal colours should be correctly identified") {
    ColourTools.isLight("333333") should equal(false)
    ColourTools.isLight("00ccff") should equal(true)
    ColourTools.isLight("ff00ff") should equal(false)
  }

  test("drops the leading # if present") {
    ColourTools.isLight("#ffffff") should equal(true)
  }
}
