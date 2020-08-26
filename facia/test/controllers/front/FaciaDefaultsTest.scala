package controllers.front

import org.scalatest.{DoNotDiscover, Matchers, FlatSpec}
import play.api.libs.json._
import test.ConfiguredTestSuite

@DoNotDiscover class FaciaDefaultsTest extends FlatSpec with Matchers with ConfiguredTestSuite {

  "FaciaDefaults" should "parse correctly" in {
    Json.parse(FaciaDefaults.defaultJson).isInstanceOf[JsValue] should be(true)
  }

}
