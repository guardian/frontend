package controllers.front

import com.gu.facia.api.models._
import common.ExecutionContexts
import implicits.FaciaContentImplicits._
import model.PressedPage
import model.facia.PressedCollection
import play.api.libs.json._

trait FapiFrontJsonLite extends ExecutionContexts{
  def get(pressedPage: PressedPage): JsObject = {
    Json.obj(
      "webTitle" -> pressedPage.seoData.webTitle,
      "collections" -> getCollections(pressedPage))}

  private def getCollections(pressedPage: PressedPage): Seq[JsValue] =
    pressedPage.collections.map(getCollection)

  private def getCollection(pressedCollection: PressedCollection): JsValue =
    JsObject(
      Json.obj(
        "displayName" -> pressedCollection.displayName,
        "href" -> pressedCollection.href,
        "id" -> pressedCollection.id,
        "content" -> pressedCollection.curatedPlusBackfillDeduplicated.filterNot(isLinkSnap).map(getContent))
      .fields
      .filterNot{ case (_, v) => v == JsNull})


  private def isLinkSnap(faciaContent: FaciaContent) = faciaContent match {
    case _: LinkSnap => true
    case _ => false}

  private def getContent(faciaContent: FaciaContent): JsValue = {
    JsObject(
      Json.obj(
        "headline" -> faciaContent.headline,
        "trailText" -> faciaContent.trailText,
        "thumbnail" -> faciaContent.maybeContent.flatMap(_.safeFields.get("thumbnail")),
        "shortUrl" -> faciaContent.shortUrl,
        "id" -> faciaContent.maybeContent.map(_.id),
        "group" -> faciaContent.group,
        "frontPublicationDate" -> faciaContent.maybeFrontPublicationDate,
        "supporting" -> getSupporting(faciaContent))
      .fields
      .filterNot{ case (_, v) => v == JsNull})
  }

  private def getSupporting(faciaContent: FaciaContent): JsValue = faciaContent match {
    case curatedContent: CuratedContent
      if curatedContent.supportingContent.nonEmpty => JsArray(curatedContent.supportingContent.map(getContent))
    case _ => JsNull
  }
}

object FapiFrontJsonLite extends FapiFrontJsonLite
