package controllers.front

import org.scalatest.DoNotDiscover
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import play.api.libs.json._
import test.ConfiguredTestSuite

@DoNotDiscover class FaciaDefaultsTest extends AnyFlatSpec with Matchers with ConfiguredTestSuite {

  "FaciaDefaults" should "parse correctly" in {
    Json.parse(FaciaDefaults.defaultJson).isInstanceOf[JsValue] should be(true)
  }

}
