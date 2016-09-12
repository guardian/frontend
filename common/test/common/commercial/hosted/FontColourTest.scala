package common.commercial.hosted

import org.scalatest.{FlatSpec, Matchers}

/*
 * For colours, see http://www.colorhexa.com/<hexcode>
 * eg. http://www.colorhexa.com/2ec869
 */
class FontColourTest extends FlatSpec with Matchers {

  "shouldHaveBrightFont" should "be false for a bright brandColour" in {
    val colour = FontColour("#2ec869") //Zootropolis
    colour.shouldHaveBrightFont should be(false)
  }

  it should "be false for another bright brandColour" in {
    val colour = FontColour("#ffc421") //Renault
    colour.shouldHaveBrightFont should be(false)
  }

  it should "be true for a dark brandColour" in {
    val colour = FontColour("#6f5200") //brown
    colour.shouldHaveBrightFont should be(true)
  }

  it should "be false for white brandColour" in {
    val colour = FontColour("#ffffff") //white
    colour.shouldHaveBrightFont should be(false)
  }

  it should "be true for black brandColour" in {
    val colour = FontColour("#000000") //black
    colour.shouldHaveBrightFont should be(true)
  }
}
