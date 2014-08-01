package model

import org.scalatest.{Matchers, FlatSpec}

class AdSuffixHandlingForFrontsTest extends FlatSpec with Matchers  {
  object NetworkFronts extends AdSuffixHandlingForFronts {
    override def id: String = ???

    override def section: String = ???

    override def analyticsName: String = ???

    override def webTitle: String = ???
  }

  object SectionFront extends AdSuffixHandlingForFronts {
    override def id: String = ???

    override def section: String = "business"

    override def analyticsName: String = ???

    override def webTitle: String = ???
  }

  object TagFront extends AdSuffixHandlingForFronts {
    override def id: String = ???

    override def section: String = "education"

    override def analyticsName: String = ???

    override def webTitle: String = ???
  }



  "Editionalised Network Front pages" should "have editions in the ad unit suffix and end with 'front'" in {
    NetworkFronts.extractAdUnitSuffixFrom("uk") should equal("uk/front")
  }

  "Editionalised Section fronts" should "end with front, and do not have editions in the ad unit suffix" in {
    SectionFront.extractAdUnitSuffixFrom("uk/business") should equal("business/front")
  }

  "Non-editionlised section fronts" should "end with 'front'" in {
    SectionFront.extractAdUnitSuffixFrom("business") should equal("business/front")
  }

  "Tag Fronts ad units" should "be the section, plus the word 'subsection'" in {
    TagFront.extractAdUnitSuffixFrom("education/universitytables") should equal("education/subsection")
  }

  "Tag fronts ad units" should "revert to their section, plus the world 'subsection'" in {
    TagFront.extractAdUnitSuffixFrom("tagfronts/actuallydontneedtocopythesection") should equal("education/subsection")
  }

}
