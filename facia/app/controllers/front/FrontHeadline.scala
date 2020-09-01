package controllers.front

import common.Logging
import model.Cached.{RevalidatableResult, WithoutRevalidationResult}
import model.facia.PressedCollection
import model.{Cached, PressedPage}
import play.api.mvc.Results

object FrontHeadline extends Results with Logging {

  val headlineNotFound: Cached.CacheableResult = WithoutRevalidationResult(
    NotFound("Could not extract headline from front"),
  )

  def collectionIsSuitableForHeadlineExtraction(collection: PressedCollection): Boolean = {
    collection.curatedPlusBackfillDeduplicated.headOption match {
      case None                 => false
      case Some(pressedContent) => pressedContent.properties.webTitle.size > 0
    }
  }

  def renderEmailHeadline(faciaPage: PressedPage): Cached.CacheableResult = {
    val webTitle = for {
      topCollection <- faciaPage.collections.filter(collectionIsSuitableForHeadlineExtraction).headOption
      topCurated <- topCollection.curatedPlusBackfillDeduplicated.headOption
    } yield RevalidatableResult.Ok(topCurated.properties.webTitle)
    webTitle.getOrElse {
      log.warn(s"headline not found for ${faciaPage.id}")
      headlineNotFound
    }
  }

}
