package model.dotcomrendering

import play.api.libs.json.{Json, Writes}

case class DotcomDeeplyReadRenderingDataModel(
    mostViewed: MostPopularOnward,
    deeplyRead: MostPopularOnward,
)
object DotcomDeeplyReadRenderingDataModel {
  implicit val writes = new Writes[DotcomDeeplyReadRenderingDataModel] {
    def writes(model: DotcomDeeplyReadRenderingDataModel) = {
      Json.obj(
        "mostViewed" -> model.mostViewed,
        "deeplyRead" -> model.deeplyRead,
      )
    }
  }

  def toJson(model: DotcomDeeplyReadRenderingDataModel): String = {
    val jsValue = Json.toJson(model)
    Json.stringify(DotcomRenderingUtils.withoutNull(jsValue))
  }
}
