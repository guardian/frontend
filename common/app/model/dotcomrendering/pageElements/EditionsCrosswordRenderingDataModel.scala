package model.dotcomrendering.pageElements

import com.gu.contentapi.client.model.v1.Crossword
import com.gu.contentapi.json.CirceEncoders._
import io.circe.syntax._
import model.dotcomrendering.DotcomRenderingUtils
import play.api.libs.json.{JsObject, Json, JsValue}

case class EditionsCrosswordRenderingDataModel(
    quick: Crossword,
    cryptic: Crossword,
)

object EditionsCrosswordRenderingDataModel {
  def toJson(model: EditionsCrosswordRenderingDataModel): JsValue =
    DotcomRenderingUtils.withoutNull(
      Json.obj(
        "quick" -> Json.parse(model.quick.asJson.toString()),
        "cryptic" -> Json.parse(model.cryptic.asJson.toString()),
      ),
    )
}
