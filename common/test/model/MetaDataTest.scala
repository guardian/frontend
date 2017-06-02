package model

import org.scalatest.{FlatSpec, Matchers}

class MetaDataTest extends FlatSpec with Matchers {

  def testMetaData(id: String, section: String): MetaData = {
    MetaData.make(
      id,
      section = Some(SectionSummary.fromId(section)),
      webTitle = "t")
  }

  "adUnitSuffix" should "just be section for a content page" in {
    testMetaData("world/2014/jun/19/obama-100-special-forces-iraq", "world").adUnitSuffix should be("world")
  }

}
