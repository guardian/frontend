package discussion
package model

import play.api.libs.json.{JsObject, JsValue}

case class Switch(
  name: String,
  description: String,
  state: Boolean
)

object Switch {

  def apply(json: JsValue): Switch = {
    Switch(
      name = (json \ "name").as[String].toLowerCase,
      description = (json \ "description").as[String],
      state = if((json \ "state").as[String] == "On") true else false
    )
  }
}