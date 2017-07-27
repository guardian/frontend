package rendering

import play.api.libs.json.JsValue

object TestComponent extends Renderable {
  override def props: Option[JsValue] = None
}
