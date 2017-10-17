package ui

import rendering.Renderable
import play.api.libs.json.JsValue

object NotFound extends Renderable {
  override def props: Option[JsValue] = None
}
