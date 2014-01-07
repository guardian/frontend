package controllers.front

import org.scalatest.{Matchers, FlatSpec}
import play.api.libs.json._

class FaciaDefaultsTest extends FlatSpec with Matchers {

  "FaciaDefaults" should "parse correctly" in {
    Json.parse(FaciaDefaults.defaultJson).isInstanceOf[JsValue] should be (true)
  }

}
