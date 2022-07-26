package model.dotcomrendering

import model.ContentFormat
import model.dotcomrendering.pageElements.PageElement
import play.api.libs.json.{Json, Writes}

// -----------------------------------------------------------------
// DCR Onwards DataModel
// -----------------------------------------------------------------

case class DotcomOnwardsRenderingDataModel(
    heading: String,
    trails: Seq[OnwardItem],
    ophanComponentName: String,
    isCuratedContent: Boolean,
)

object DotcomOnwardsRenderingDataModel {

  implicit val pageElementWrites = PageElement.pageElementWrites

  implicit val writes = new Writes[DotcomOnwardsRenderingDataModel] {
    def writes(model: DotcomOnwardsRenderingDataModel) = {
      Json.obj(
        "heading" -> model.heading,
        "trails" -> model.trails,
        "ophanComponentName" -> model.ophanComponentName,
        "isCuratedContent" -> model.isCuratedContent,
      )
    }
  }

  def toJson(model: DotcomOnwardsRenderingDataModel): String = {
    val jsValue = Json.toJson(model)
    Json.stringify(DotcomRenderingUtils.withoutNull(jsValue))
  }
}
