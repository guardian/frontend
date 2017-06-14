package uiComponent

import play.api.libs.json.JsValue

object TestComponent extends UIComponent {
  override def asJson: Option[JsValue] = None
}
