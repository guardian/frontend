package ui

import rendering.Renderable
import rendering.core.JavascriptProps
import play.api.libs.json.{JsValue, Json}

object NotFound extends Renderable {
  override def props: Option[JsValue] = Some(JavascriptProps.default().asJsValue())
}
