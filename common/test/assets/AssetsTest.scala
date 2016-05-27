package common.Assets

import org.scalatest.FlatSpec
import org.scalatest.Matchers
import org.scalatestplus.play.OneAppPerSuite

class AssetsTest extends FlatSpec with Matchers with OneAppPerSuite {
  "Static" should "collect asset maps" in {
    val static = new Assets("simon says", "assets/testassets.map", true)

    static("zen1").toString should be("simon says" + "no snowflake ever falls in the wrong place.")
    static("zen2").toString should be("simon says" + "water which is too pure has no fish.")
    static("zen3").toString should be("simon says" + "the quieter you become the more you are able to hear.")
  }

}
