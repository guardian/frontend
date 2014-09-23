package slices

import play.api.libs.json.Json

object ContainerJsonConfig {
  implicit val jsonWrites = Json.writes[ContainerJsonConfig]
}

case class ContainerJsonConfig(
  name: String,
  groups: Option[Seq[String]]
)
