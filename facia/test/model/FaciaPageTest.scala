package model

import org.scalatest.{FlatSpec, Matchers}

class FaciaPageTest extends FlatSpec with Matchers {

  private def toPressedPage(id: String): PressedPage = {
    PressedPage(id, SeoData.empty, FrontProperties.empty, Nil)
  }

  "keywordIds" should "be same as section keyword ID for content pages in a section" in {
    toPressedPage("fashion").keywordIds should be(Seq("fashion/fashion"))
  }

  it should "be same as section keyword ID for content pages in a UK editionalised section" in {
    toPressedPage("uk/culture").keywordIds should be(Seq("culture/culture"))
  }

  it should "be same as section keyword ID for content pages in a AU editionalised section" in {
    toPressedPage("au/business").keywordIds should be(Seq("business/business"))
  }

  it should "be same as section keyword ID for content pages in a US editionalised section" in {
    toPressedPage("us/commentisfree").keywordIds should be(Seq("commentisfree/commentisfree"))
  }

  it should
    "be same as section keyword ID for content pages in a commercial hub" in {
    toPressedPage("sustainable-business").keywordIds should be(Seq(
      "sustainable-business/sustainable-business"))
  }

  it should
    "reflect that front could be either a section front or a tag page in a partner zone" in {
    toPressedPage("sustainable-business/grundfos-partner-zone").keywordIds should be(Seq(
      "sustainable-business/grundfos-partner-zone",
      "sustainable-business-grundfos-partner-zone/sustainable-business-grundfos-partner-zone"))
  }

}
