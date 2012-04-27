package common

import org.scalatest.FlatSpec
import org.scalatest.matchers.ShouldMatchers

class StaticTest extends FlatSpec with ShouldMatchers {
  "Static" should "collect asset maps" in {
    val static = new Static("simon says")

    static("zen1") should be("simon says" + "no snowflake ever falls in the wrong place.")
    static("zen2") should be("simon says" + "water which is too pure has no fish.")
    static("zen3") should be("simon says" + "the quieter you become the more you are able to hear.")
  }
}
