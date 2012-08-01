package common

import org.scalatest.FlatSpec
import org.scalatest.matchers.ShouldMatchers
import play.api.test.FakeApplication
import play.api.test.Helpers._

class StaticTest extends FlatSpec with ShouldMatchers {
  "Static" should "collect asset maps" in {
    running(FakeApplication()) {
      val static = new StaticAssets("simon says")

      static("zen1").toString should be("simon says" + "no snowflake ever falls in the wrong place.")
      static("zen2").toString should be("simon says" + "water which is too pure has no fish.")
      static("zen3").toString should be("simon says" + "the quieter you become the more you are able to hear.")
    }
  }

  it should "render as a JS Module" in {
    running(FakeApplication()) {
      val static = new StaticAssets("simon says")

      static("jsmodule").asModulePath should be("simon says" + "http://www.foo.bar.com/name")
    }
  }
}
