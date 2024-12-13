package model.dotcomrendering.pageElements

import com.gu.contentapi.client.model.v1.Crossword
import com.gu.contentapi.json.CirceEncoders._
import io.circe.syntax._
import implicits.Dates.CapiRichDateTime
import play.api.libs.json.{JsArray, JsNull, JsObject, JsValue, Json}

case class EditionsCrosswordRenderingDataModel(
    crosswords: Iterable[Crossword],
)

object EditionsCrosswordRenderingDataModel {
  def apply(crosswords: Iterable[Crossword]): EditionsCrosswordRenderingDataModel =
    new EditionsCrosswordRenderingDataModel(crosswords.map(crossword => {
      val shipSolutions =
        crossword.dateSolutionAvailable
          .map(_.toJoda.isBeforeNow)
          .getOrElse(crossword.solutionAvailable)

      if (shipSolutions) {
        crossword
      } else {
        crossword.copy(entries = crossword.entries.map(_.copy(solution = None)))
      }
    }))

  def withoutNull(json: JsValue): JsValue = {
    json match {
      case JsObject(fields) =>
        JsObject(fields.collect {
          case (key, value) if value != JsNull => key -> withoutNull(value)
        })
      case JsArray(values) =>
        JsArray(values.map(withoutNull))
      case other => other
    }
  }

  def toJson(model: EditionsCrosswordRenderingDataModel): JsValue =
    withoutNull(
      Json.obj(
        "crosswords" -> Json.parse(model.crosswords.asJson.toString()),
      ),
    )
}
