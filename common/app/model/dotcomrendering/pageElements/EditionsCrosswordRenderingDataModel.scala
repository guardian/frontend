package model.dotcomrendering.pageElements
import model.CrosswordData
import play.api.libs.json.{Json, JsValue}

case class EditionsCrosswordRenderingDataModel(
    crosswords: Iterable[CrosswordData],
)

object EditionsCrosswordRenderingDataModel {
  def toJson(model: EditionsCrosswordRenderingDataModel): JsValue = {
    Json.obj(
      "crosswords" -> Json.toJson(model.crosswords),
    )
  }
}
