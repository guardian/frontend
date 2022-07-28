package common.Assets

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.scalatestplus.play.guice.GuiceOneAppPerSuite

class AssetsTest extends AnyFlatSpec with Matchers with GuiceOneAppPerSuite {
  "Static" should "collect asset maps" in {
    val static = new Assets("simon says", "assets/testassets.map", true)

    static("zen1") should be("simon says" + "no snowflake ever falls in the wrong place.")
    static("zen2") should be("simon says" + "water which is too pure has no fish.")
    static("zen3") should be("simon says" + "the quieter you become the more you are able to hear.")
  }

}
