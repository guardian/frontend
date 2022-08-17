package common.commercial.hosted

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

/*
 * For colours, see http://www.colorhexa.com/<hexcode>
 * eg. http://www.colorhexa.com/2ec869
 */
class ColourTest extends AnyFlatSpec with Matchers {

  "isDark" should "be true for Zootropolis green" in {
    val zootropolisColour = Colour("#2ec869")
    zootropolisColour shouldBe Symbol("dark")
  }

  it should "be false for a bright colour e.g Renault Yellow" in {
    val renaultColour = Colour("#ffc421")
    renaultColour should not be Symbol("dark")
  }

  it should "be true for a dark colour" in {
    val brown = Colour("#6f5200")
    brown shouldBe Symbol("dark")
  }

  it should "be false for white" in {
    val white = Colour("#ffffff")
    white should not be Symbol("dark")
  }

  it should "be true for black" in {
    val black = Colour("#000000")
    black shouldBe Symbol("dark")
  }

  it should "be true for Visit Britain colour" in {
    val visitBritainColour = Colour("#E41F13")
    visitBritainColour shouldBe Symbol("dark")
  }

  it should "be true for Chester Zoo colour" in {
    val chesterZooColour = Colour("#E31B22")
    chesterZooColour shouldBe Symbol("dark")
  }
}
