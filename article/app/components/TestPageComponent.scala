package components

import play.api.libs.json.{JsValue, Json}
import uiComponent.{UIComponent, UIComponentState}

case class TestPageState(headline: String, section: String) extends UIComponentState {
  def asJson: JsValue = Json.obj(
    "page" -> Json.obj(
      "headline" -> headline,
      "section" -> section
    )
  )
}

object TestPageComponent extends UIComponent[TestPageState]("components/c.js")
