package rendering

import play.api.libs.json.JsValue

trait Renderable {
  def props: Option[JsValue]
}


