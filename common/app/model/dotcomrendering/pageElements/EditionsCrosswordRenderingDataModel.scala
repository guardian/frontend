package model.dotcomrendering.pageElements

import com.gu.contentapi.client.model.v1.Crossword
import com.gu.contentapi.json.CirceEncoders._
import io.circe.syntax._
import model.CrosswordData
import play.api.libs.json.{JsValue, Json}

case class EditionsCrosswordRenderingDataModel(
    crosswords: Iterable[Crossword],
    newCrosswords: Iterable[CrosswordData],
)

object EditionsCrosswordRenderingDataModel {
  def toJson(model: EditionsCrosswordRenderingDataModel): JsValue = {
    Json.obj(
      "crosswords" -> Json.parse(model.crosswords.asJson.deepDropNullValues.toString()),
      "newCrosswords" -> Json.toJson(model.newCrosswords),
    )
  }
}
