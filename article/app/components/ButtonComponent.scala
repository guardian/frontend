package components

import play.api.libs.json.{JsValue, Json}

case class ButtonState(title: String) extends UIComponentState {
  implicit val buttonStateWrites = Json.writes[ButtonState]
  def asJson: JsValue = Json.toJson(this)
}

object ButtonComponent extends UIComponent[ButtonState]("js/c.js")
