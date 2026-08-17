package controllers.front

import com.gu.facia.client.models.{Test, VariantMeta}
import model.PressedPage
import model.facia.PressedCollection
import model.pressed._
import play.api.libs.json._

trait FapiFrontJsonMinimal {
  def get(pressedPage: PressedPage): JsObject = {
    Json.obj("webTitle" -> pressedPage.seoData.webTitle, "collections" -> getCollections(pressedPage))
  }

  private def getCollections(pressedPage: PressedPage): Seq[JsValue] =
    pressedPage.collections.map(getCollection)

  private def getCollection(pressedCollection: PressedCollection): JsValue =
    JsObject(
      Json
        .obj(
          "displayName" -> pressedCollection.displayName,
          "href" -> pressedCollection.href,
          "id" -> pressedCollection.id,
          "content" -> pressedCollection.curatedPlusBackfillDeduplicated.filterNot(isLinkSnap).map(getContent),
        )
        .fields
        .filterNot { case (_, v) => v == JsNull },
    )

  private def isLinkSnap(faciaContent: PressedContent) =
    faciaContent match {
      case _: LinkSnap => true
      case _           => false
    }

  private def getContent(faciaContent: PressedContent): JsValue = {
    JsObject(
      Json
        .obj(
          "headline" -> faciaContent.header.headline,
          "trailText" -> faciaContent.card.trailText,
          "thumbnail" -> faciaContent.properties.maybeContent.flatMap(_.trail.thumbnailPath),
          "shortUrl" -> faciaContent.card.shortUrl,
          "id" -> faciaContent.properties.maybeContent.map(_.metadata.id),
          "group" -> faciaContent.card.group,
          "frontPublicationDate" -> faciaContent.properties.maybeFrontPublicationDate,
          "supporting" -> getSupporting(faciaContent),
          "tests" -> getMinimalTests(faciaContent.properties.tests),
        )
        .fields
        .filterNot { case (_, v) => v == JsNull },
    )
  }

  private case class MinimalTest(
      testUuid: String,
      variantMeta: List[VariantMeta],
      startDate: Option[Long],
      expiryDate: Option[Long],
      hasManuallyEndedOnThisTrail: Boolean,
  )

  implicit private val minimalTestWrites: Writes[MinimalTest] = Json.writes[MinimalTest]

  private def getMinimalTests(tests: Option[List[Test]]): JsValue =
    tests.filter(_.nonEmpty) match {
      case Some(tests) =>
        JsArray(
          tests.map(test =>
            Json.toJson(
              MinimalTest(
                testUuid = test.testUuid,
                variantMeta = test.variantMeta,
                startDate = test.startDate,
                expiryDate = test.expiryDate,
                hasManuallyEndedOnThisTrail = test.hasManuallyEndedOnThisTrail,
              ),
            ),
          ),
        )
      case None => JsNull
    }

  private def getSupporting(faciaContent: PressedContent): JsValue =
    faciaContent match {
      case curatedContent: CuratedContent if curatedContent.supportingContent.nonEmpty =>
        JsArray(curatedContent.supportingContent.map(getContent))
      case _ => JsNull
    }
}

object FapiFrontJsonMinimal extends FapiFrontJsonMinimal
