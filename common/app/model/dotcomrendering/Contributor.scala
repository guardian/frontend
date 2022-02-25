package model.dotcomrendering

import play.api.libs.json.Json

case class Contributor(name: String, imageUrl: Option[String])

object Contributor {
  implicit val writes = Json.writes[Contributor]
}
