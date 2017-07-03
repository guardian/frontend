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

  "shouldHideReaderRevenue" should "hide if sensitive and published before cutoff" in {
    ???
  }

  it should "not hide if sensitive and published after cutoff" in {
    ???
  }

  it should "hide if shouldHideReaderRevenue is true, regardless of publication date or sensitive flag" in {
    ???
  }

  it should "hide if content is paid, regardless of publication date or sensitive flag" in {
    ???
  }
}
