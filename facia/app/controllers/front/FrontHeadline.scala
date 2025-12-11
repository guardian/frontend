package controllers.front

import common.GuLogging
import model.Cached.{RevalidatableResult, WithoutRevalidationResult}
import model.facia.PressedCollection
import model.{Cached, PressedPage}
import play.api.mvc.Results

object FrontHeadline extends Results with GuLogging {

  val headlineNotFound: Cached.CacheableResult = WithoutRevalidationResult(
    NotFound("Could not extract headline from front"),
  )

  private[this] def headline(collection: PressedCollection): Option[String] = {
    val headlines = for {
      content <- collection.curatedPlusBackfillDeduplicated
      if content.properties.webTitle != ""
    } yield content.properties.webTitle

    headlines.headOption
  }

  def renderEmailHeadline(faciaPage: PressedPage): Cached.CacheableResult = {
    val headlineOpt = faciaPage.collections.view
      .map(headline)
      .find(_.isDefined)
      .flatten

    headlineOpt match {
      case Some(headlinestr) => RevalidatableResult.Ok(headlinestr)
      case None              => {
        log.warn(s"headline not found for ${faciaPage.id}")
        headlineNotFound
      }
    }
  }
}
