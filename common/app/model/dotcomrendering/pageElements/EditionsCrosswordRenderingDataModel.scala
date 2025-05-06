package model.dotcomrendering.pageElements
import model.CrosswordData
import play.api.libs.json.{JsValue, Json}

case class EditionsCrosswordRenderingDataModel(
    crosswords: Iterable[CrosswordData],
)

object EditionsCrosswordRenderingDataModel {
  def toJson(model: EditionsCrosswordRenderingDataModel): JsValue = {
    Json.obj(
      "newCrosswords" -> Json.toJson(model.crosswords),
    )
  }
}
