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
      "content" -> pressedCollection.curatedPlusBackfillDeduplicated.take(4).map(isCuratedContent),
    )

  def isCuratedContent(content: PressedContent): JsValue =
    content match {
      case c: CuratedContent => getContent(c)
      case _                 => Json.obj()
    }

  private def getContent(content: CuratedContent): JsValue = {
    lazy val toneClass = TrailCssClasses.toneClass(content)
    lazy val webPublicationDate = if (toneClass == "tone-news") ContentOldAgeDescriber(content) else ""

    val thumbnail = {
      val maybeContent = content.properties.maybeContent

      maybeContent
        .flatMap(_.trail.thumbnailPath)
        .getOrElse(ImgSrc(maybeContent.flatMap(_.trail.trailPicture.flatMap(_.largestImageUrl)).getOrElse(""), Item140))
    }

    JsObject(
      Json
        .obj(
          "headline" -> content.header.headline,
          "trailText" -> content.card.trailText,
          "url" -> content.header.url,
          "thumbnail" -> thumbnail,
          "id" -> content.properties.maybeContent.map(_.metadata.id),
          "byline" -> content.properties.byline,
          "isComment" -> content.header.isComment,
          "isVideo" -> content.header.isVideo,
          "isAudio" -> content.header.isAudio,
          "isGallery" -> content.header.isGallery,
          "toneClass" -> toneClass,
          "webPublicationDate" -> webPublicationDate,
          "showWebPublicationDate" -> !webPublicationDate.isEmpty,
        )
        .fields
        .filterNot { case (_, v) => v == JsNull },
    )
  }
}
