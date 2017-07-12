package components

import play.api.libs.json.{JsValue, Json}
import uiComponent.{StateSerialization, UIComponent}

case class TestPageState(headline: String, section: String)

object TestPageState {
  implicit object TestPageStateSerialization extends StateSerialization[TestPageState] {
    def asJson(testPageState: TestPageState): JsValue = Json.obj(
      "page" -> Json.obj(
        "headline" -> testPageState.headline,
        "section" -> testPageState.section
      )
    )
  }
}

object TestPageComponent extends UIComponent("c.js")
