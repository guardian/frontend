package views.support

import model.facia.PressedCollection
import model.pressed.{CuratedContent, PressedContent}
import play.api.libs.json._

object FaciaToMicroFormat2Helpers {
  def getCollection(pressedCollection: PressedCollection): JsValue =
    Json.obj(
      "displayName" -> pressedCollection.displayName,
      "href" -> pressedCollection.href,
      "id" -> pressedCollection.id,
      "showContent" -> pressedCollection.curatedPlusBackfillDeduplicated.nonEmpty,
      "content" -> pressedCollection.curatedPlusBackfillDeduplicated.take(8).map(isCuratedContent))

  def isCuratedContent(content: PressedContent): JsValue = content match {
    case c: CuratedContent => getContent(c)
    case _ => Json.obj()
  }

  private def getContent(content: CuratedContent): JsValue = {
    lazy val toneClass = TrailCssClasses.toneClass(content)
    lazy val webPublicationDate = if (toneClass == "tone-news") ContentOldAgeDescriber(content) else ""

    JsObject(
      Json.obj(
        "headline" -> content.header.headline,
        "trailText" -> content.card.trailText,
        "url" -> content.properties.href,
        "thumbnail" -> content.properties.maybeContent.flatMap(_.trail.thumbnailPath),
        "id" -> content.properties.maybeContent.map(_.metadata.id),
        "byline" -> content.properties.byline,
        "isComment" -> content.header.isComment,
        "isVideo" -> content.header.isVideo,
        "isAudio" -> content.header.isAudio,
        "isGallery" -> content.header.isGallery,
        "toneClass" -> toneClass,
        "webPublicationDate" -> webPublicationDate,
        "showWebPublicationDate" -> !webPublicationDate.isEmpty)
      .fields
      .filterNot { case (_, v) => v == JsNull })
  }
}
