package model.dotcomrendering

import play.api.libs.json.Json
import play.api.libs.json.OWrites

case class Contributor(name: String, imageUrl: Option[String], largeImageUrl: Option[String])

object Contributor {
  implicit val writes: OWrites[Contributor] = Json.writes[Contributor]
}
