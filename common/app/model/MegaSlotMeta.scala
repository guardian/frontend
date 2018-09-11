package model

import play.api.libs.json.Json

case class MegaSlotMeta(
  headline: String,
  uk: String,
  us: String,
  au: String,
  row: String
)

object MegaSlotMeta {
  implicit val format = Json.format[MegaSlotMeta]
}
