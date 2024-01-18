package layout.slices

import play.api.libs.json.{Json, OFormat}

case class ContainerJsonConfig(
    name: String,
    groups: Option[Seq[String]],
)

object ContainerJsonConfig {
  implicit val jsonFormat: OFormat[ContainerJsonConfig] = Json.format[ContainerJsonConfig]
}
