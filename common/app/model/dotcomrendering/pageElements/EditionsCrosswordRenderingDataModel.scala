package model.dotcomrendering.pageElements

import com.gu.contentapi.client.model.v1.Crossword
import model.dotcomrendering.DotcomRenderingUtils.withoutNull
import play.api.libs.json.{JsValue, Json, Writes}
import com.gu.contentapi.json.CirceEncoders._
import io.circe.syntax._

case class EditionsCrosswordRenderingDataModel(
    quick: Crossword,
    cryptic: Crossword,
)

object EditionsCrosswordRenderingDataModel {
  // we Json.parse this into a JsValue to ensure we get the raw JSON
  // from the Content API rather than a Json.stringified version
  private def contentApiToJsonValue(crossword: Crossword): JsValue = {
    Json.parse(crossword.asJson.toString())
  }
  implicit val writes: Writes[EditionsCrosswordRenderingDataModel] =
    new Writes[EditionsCrosswordRenderingDataModel] {
      def writes(model: EditionsCrosswordRenderingDataModel) = {
        Json.obj(
          "quick" -> contentApiToJsonValue(model.quick),
          "cryptic" -> contentApiToJsonValue(model.cryptic),
        )
      }
    }
  def toJson(model: EditionsCrosswordRenderingDataModel): String = {
    val jsValue = Json.toJson(model)
    Json.stringify(withoutNull(jsValue))
  }
}
