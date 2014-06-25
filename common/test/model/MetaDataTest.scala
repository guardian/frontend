package model

import org.scalatest.{Matchers, FlatSpec, FunSuite}

class MetaDataTest extends FlatSpec with Matchers {

  private case class TestMetaData(id: String, section: String) extends MetaData {
    def analyticsName = "n"
    def webTitle = "t"
  }

  "adUnitSuffix" should "just be section for a content page" in {
    TestMetaData("world/2014/jun/19/obama-100-special-forces-iraq", "world").adUnitSuffix should be("world")
  }

}
