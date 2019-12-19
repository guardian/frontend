package controllers.front

import common.Logging
import model.Cached.{RevalidatableResult, WithoutRevalidationResult}
import model.{Cached, PressedPage}
import play.api.mvc.Results

object FrontHeadline extends Results with Logging {

  val headlineNotFound: Cached.CacheableResult = WithoutRevalidationResult(NotFound("Could not extract headline from front"))

  def headline(faciaPage: PressedPage): Option[String] = {
    for {
      topCollection <- faciaPage.collections.headOption
      topCurated <- topCollection.curatedPlusBackfillDeduplicated.headOption
    } yield topCurated.properties.webTitle
  }

  def renderEmailHeadline(faciaPage: PressedPage): Cached.CacheableResult = {
    val  h = headline(faciaPage)

    h match {
      case Some(h) => RevalidatableResult.Ok(h)
      case None =>
        log.warn(s"headline not found for ${faciaPage.id}")
        headlineNotFound
    }
  }
}
