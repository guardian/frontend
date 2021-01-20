package layout.slices

import play.api.libs.json.Json

case class ContainerJsonConfig(
    name: String,
    groups: Option[Seq[String]],
)

object ContainerJsonConfig {
  implicit val jsonFormat = Json.format[ContainerJsonConfig]
}
