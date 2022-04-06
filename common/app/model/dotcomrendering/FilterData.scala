package model.dotcomrendering

import model.dotcomrendering.pageElements.PageElement
import play.api.libs.json.{Json, Writes}

case class Filter(name: String,
                  `type`: String,
                  count: Int,
                  blocks: Seq[String],
                  percentage_blocks: Int)

object Filter {
  val filterWrites: Writes[Filter] = Json.writes[Filter]
}

case class FilterData(results: Seq[Filter],
                      model: String,
                      entityType: Seq[String]) {
}

object FilterData {
  val filterDataWrites: Writes[FilterData] = Json.writes[FilterData]
}
