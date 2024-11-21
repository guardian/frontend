package model.dotcomrendering.pageElements

import com.gu.contentapi.client.model.v1.{Content, Crossword}
import com.gu.contentapi.json.CirceEncoders._
import io.circe.JsonObject
import io.circe.syntax._
import scala.Function.{const, uncurried}

case class EditionsCrosswordRenderingDataModel(
    crosswords: Iterable[Crossword],
)

object EditionsCrosswordRenderingDataModel {
  def toJson(model: EditionsCrosswordRenderingDataModel): String = {
    JsonObject(
      "crosswords" -> model.crosswords.map(_.asJson.dropNullValues).asJson,
    ).asJson.noSpaces
  }

  /** Takes a list of CAPI content and filters it to get a maximum of one of each type of crossword. Each crossword
    * selected will be the earliest of its type in the list. In other words, if the most recent of each type of
    * crossword is required then the CAPI content must be ordered by "newest".
    *
    * @param content
    *   Some CAPI content containing crosswords
    */
  def fromContent(content: Iterable[Content]): EditionsCrosswordRenderingDataModel = {
    val firstOfEach =
      content
        .flatMap(_.crossword)
        // Group by type of crossword, then take the first in the group
        .groupMapReduce(_.`type`)(identity)(uncurried(const))
        .values

    EditionsCrosswordRenderingDataModel(firstOfEach)
  }
}
