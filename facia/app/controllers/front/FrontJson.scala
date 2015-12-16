package controllers.front

import common.ExecutionContexts
import model.facia.PressedCollection
import model._
import model.pressed._
import implicits.FaciaContentFrontendHelpers.FaciaContentFrontendHelper
import play.api.libs.json._
import scala.concurrent.Future

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


  private def isLinkSnap(faciaContent: PressedContent) = faciaContent match {
    case _: LinkSnap => true
    case _ => false}

  private def getContent(faciaContent: PressedContent): JsValue = {
    JsObject(
      Json.obj(
        "headline" -> faciaContent.header.headline,
        "trailText" -> faciaContent.card.trailText,
        "thumbnail" -> faciaContent.properties.maybeContent.flatMap(_.trail.thumbnailPath),
        "shortUrl" -> faciaContent.card.shortUrl,
        "id" -> faciaContent.properties.maybeContent.map(_.metadata.id),
        "group" -> faciaContent.card.group,
        "frontPublicationDate" -> faciaContent.properties.maybeFrontPublicationDate,
        "supporting" -> getSupporting(faciaContent))
      .fields
      .filterNot{ case (_, v) => v == JsNull})
  }

  private def getSupporting(faciaContent: PressedContent): JsValue = faciaContent match {
    case curatedContent: CuratedContent
      if curatedContent.supportingContent.nonEmpty => JsArray(curatedContent.supportingContent.map(getContent))
    case _ => JsNull
  }
}

object FapiFrontJsonLite extends FapiFrontJsonLite
