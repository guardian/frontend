package model.dotcomrendering.pageElements

import com.gu.contentapi.client.model.v1.Crossword
import com.gu.contentapi.json.CirceEncoders._
import io.circe.JsonObject
import io.circe.syntax._

case class EditionsCrosswordRenderingDataModel(
    quick: Crossword,
    cryptic: Crossword,
)

object EditionsCrosswordRenderingDataModel {
  def toJson(model: EditionsCrosswordRenderingDataModel): String = {
    JsonObject(
      "quick" -> model.quick.asJson.dropNullValues,
      "cryptic" -> model.cryptic.asJson.dropNullValues,
    ).asJson.dropNullValues.noSpaces
  }
}
