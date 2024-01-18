package model.dotcomrendering

import play.api.libs.json.{Json, OWrites}

case class Contributor(name: String, imageUrl: Option[String], largeImageUrl: Option[String])

object Contributor {
  implicit val writes: OWrites[Contributor] = Json.writes[Contributor]
}
