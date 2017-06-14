package components

import play.api.libs.json.{JsValue, Json}
import uiComponent.{UIComponent, UIComponentState}

case class ButtonState(title: String) extends UIComponentState {
  implicit val buttonStateWrites = Json.writes[ButtonState]
  def asJson: JsValue = Json.toJson(this)
}

object ButtonComponent extends UIComponent[ButtonState]("components/c.js")
