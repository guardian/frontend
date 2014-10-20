package model

import org.scalatest.{FlatSpec, Matchers}

class FaciaPageTest extends FlatSpec with Matchers {

  private def toFaciaPage(id: String): FaciaPage = {
    FaciaPage(id, SeoData.empty, FrontProperties.empty, Nil)
  }

  "keywordIds" should "be same as section keyword ID for content pages in a section" in {
    toFaciaPage("fashion").keywordIds should be(Seq("fashion/fashion"))
  }

  it should "be same as section keyword ID for content pages in an editionalised section" in {
    toFaciaPage("uk/culture").keywordIds should be(Seq("culture/culture"))
  }

  it should
    "be same as section keyword ID for content pages in a commercial hub" in {
    toFaciaPage("sustainable-business").keywordIds should be(Seq(
      "sustainable-business/sustainable-business"))
  }

  it should
    "reflect that front could be either a section front or a tag page in a partner zone" in {
    toFaciaPage("sustainable-business/grundfos-partner-zone").keywordIds should be(Seq(
      "sustainable-business/grundfos-partner-zone",
      "sustainable-business-grundfos-partner-zone/sustainable-business-grundfos-partner-zone"))
  }

}
