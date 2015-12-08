package model

import org.scalatest.{Matchers, FlatSpec}

class AdSuffixHandlingForFrontsTest extends FlatSpec with Matchers  {
  val NetworkFronts = MetaData.make(
    id = "",
    section = "",
    analyticsName = "",
    webTitle = "")


  val SectionFront = MetaData.make(
    id = "",
    section = "business",
    analyticsName = "",
    webTitle= "")

  val TagFront = MetaData.make(
    id = "",
    section = "education",
    analyticsName = "",
    webTitle = "")

  "Editionalised Network Front pages" should "have editions in the ad unit suffix and end with 'front'" in {
    AdSuffixHandlingForFronts.extractAdUnitSuffixFrom("uk", NetworkFronts.section) should equal("uk/front")
  }

  "Editionalised Section fronts" should "end with front, and do not have editions in the ad unit suffix" in {
    AdSuffixHandlingForFronts.extractAdUnitSuffixFrom("uk/business", SectionFront.section) should equal("business/front")
  }

  "Non-editionlised section fronts" should "end with 'front'" in {
    AdSuffixHandlingForFronts.extractAdUnitSuffixFrom("business", SectionFront.section) should equal("business/front")
  }

  "Tag Fronts ad units" should "be the section, plus the word 'subsection'" in {
    AdSuffixHandlingForFronts.extractAdUnitSuffixFrom("education/universitytables", TagFront.section) should equal("education/subsection")
  }

  "Tag fronts ad units" should "revert to their section, plus the world 'subsection'" in {
    AdSuffixHandlingForFronts.extractAdUnitSuffixFrom("tagfronts/actuallydontneedtocopythesection", TagFront.section) should equal("education/subsection")
  }

}
