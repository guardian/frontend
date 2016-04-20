package model

import org.scalatest.{Matchers, FlatSpec}

class MetaDataTest extends FlatSpec with Matchers {

  def testMetaData(id: String, section: String) = {
    MetaData.make(
      id,
      section,
      analyticsName = "n",
      webTitle = "t")
  }

  "adUnitSuffix" should "just be section for a content page" in {
    testMetaData("world/2014/jun/19/obama-100-special-forces-iraq", "world").adUnitSuffix should be("world")
  }

}
