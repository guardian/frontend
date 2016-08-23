package common.commercial.hosted

import org.scalatest.{FlatSpec, Matchers}

/*
 * For colours, see http://www.colorhexa.com/<hexcode>
 * eg. http://www.colorhexa.com/2ec869
 */
class FontColourTest extends FlatSpec with Matchers {

  "shouldHaveDarkBackground" should "be true for a bright brandColour" in {
    val colour = FontColour("#2ec869")
    colour.shouldHaveDarkBackground should be(true)
  }

  it should "be true for another bright brandColour" in {
    val colour = FontColour("#ffc421")
    colour.shouldHaveDarkBackground should be(true)
  }

  it should "be false for a dark brandColour" in {
    val colour = FontColour("#6f5200")
    colour.shouldHaveDarkBackground should be(false)
  }

  it should "be true for white brandColour" in {
    val colour = FontColour("#ffffff")
    colour.shouldHaveDarkBackground should be(true)
  }

  it should "be false for black brandColour" in {
    val colour = FontColour("#000000")
    colour.shouldHaveDarkBackground should be(false)
  }
}
