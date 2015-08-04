package slices

import play.api.libs.json.Json

object ContainerJsonConfig {
  implicit val jsonFormat = Json.format[ContainerJsonConfig]
}

case class ContainerJsonConfig(
  name: String,
  groups: Option[Seq[String]]
)
