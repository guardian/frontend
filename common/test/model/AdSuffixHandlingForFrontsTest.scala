package model

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

class AdSuffixHandlingForFrontsTest extends AnyFlatSpec with Matchers {
  val NetworkFronts = MetaData.make(id = "", section = None, webTitle = "")

  val SectionFront = MetaData.make(id = "", section = Some(SectionId.fromId("business")), webTitle = "")

  val TagFront = MetaData.make(id = "", section = Some(SectionId.fromId("education")), webTitle = "")

  "Editionalised Network Front pages" should "have editions in the ad unit suffix and end with 'front'" in {
    AdSuffixHandlingForFronts.extractAdUnitSuffixFrom("uk", NetworkFronts.sectionId) should equal("uk/front")
  }

  "Editionalised Section fronts" should "end with front, and do not have editions in the ad unit suffix" in {
    AdSuffixHandlingForFronts.extractAdUnitSuffixFrom("uk/business", SectionFront.sectionId) should equal(
      "business/front",
    )
  }

  "Non-editionlised section fronts" should "end with 'front'" in {
    AdSuffixHandlingForFronts.extractAdUnitSuffixFrom("business", SectionFront.sectionId) should equal("business/front")
  }

  "Tag Fronts ad units" should "be the section, plus the word 'subsection'" in {
    AdSuffixHandlingForFronts.extractAdUnitSuffixFrom("education/universitytables", TagFront.sectionId) should equal(
      "education/subsection",
    )
  }

  "Tag fronts ad units" should "revert to their section, plus the world 'subsection'" in {
    AdSuffixHandlingForFronts.extractAdUnitSuffixFrom(
      "tagfronts/actuallydontneedtocopythesection",
      TagFront.sectionId,
    ) should equal("education/subsection")
  }

}
