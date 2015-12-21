package views.support

import com.gu.facia.api.models.{CuratedContent, FaciaContent}
import model.facia.PressedCollection
import play.api.libs.json._
import implicits.FaciaContentImplicits._

object FaciaToMicroFormat2Helpers {
  def getCollection(pressedCollection: PressedCollection): JsValue =
    Json.obj(
      "displayName" -> pressedCollection.displayName,
      "href" -> pressedCollection.href,
      "id" -> pressedCollection.id,
      "showContent" -> pressedCollection.curatedPlusBackfillDeduplicated.nonEmpty,
      "content" -> pressedCollection.curatedPlusBackfillDeduplicated.take(8).map(isCuratedContent))

  def isCuratedContent(content: FaciaContent): JsValue = content match {
    case c: CuratedContent => getContent(c)
    case _ => Json.obj()
  }

  private def getContent(content: CuratedContent): JsValue =
    JsObject(
      Json.obj(
        "headline" -> content.headline,
        "trailText" -> content.trailText,
        "url" -> content.href,
        "thumbnail" -> content.maybeContent.flatMap(_.safeFields.get("thumbnail")),
        "id" -> content.maybeContent.map(_.id),
        "frontPublicationDate" -> content.maybeFrontPublicationDate,
        "byline" -> content.byline,
        "isComment" -> content.isComment,
        "isVideo" -> content.isVideo,
        "isAudio" -> content.isAudio,
        "isGallery" -> content.isGallery,
        "toneClass" -> TrailCssClasses.toneClass(content),
        "showWebPublicationDate" -> false)
      .fields
      .filterNot{ case (_, v) => v == JsNull})
}
