package uiComponent

import play.api.libs.json.JsValue

trait UIComponent {
  def props: Option[JsValue]
}


