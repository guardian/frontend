package common.commercial.hosted

import org.scalatest.{FlatSpec, Matchers}

class CampaignColourTest extends FlatSpec with Matchers {

  "isDarkBackground" should "be true for dark brandColour" in {

    val colour = CampaignColour("#2ec869")

    colour.isDarkBackground should be(true)
  }

  it should "be false for dark brandColour" in {

    val colour = CampaignColour("#ffc421")

    colour.isDarkBackground should be(false)
  }
}
