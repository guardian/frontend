package model.dotcomrendering

import play.api.libs.json.{Format, Json, Writes}

case class Filter(name: String, `type`: String, count: Int, blocks: Seq[String], percentage_blocks: Float)

object Filter {
  val filterWrites: Writes[Filter] = Json.writes[Filter]
  implicit val filterFormat: Format[Filter] = Json.format[Filter]
}

case class FilterData(results: Seq[Filter], model: String, entity_types: Seq[String]) {}

object FilterData {
  val filterDataWrites: Writes[FilterData] = Json.writes[FilterData]
  implicit val filterDataFormat: Format[FilterData] = Json.format[FilterData]
}
