package controllers.front

import common.Logging
import model.Cached.{RevalidatableResult, WithoutRevalidationResult}
import model.{Cached, PressedPage}
import play.api.mvc.Results

object FrontHeadline extends Results with Logging {

  val headlineNotFound: Cached.CacheableResult = WithoutRevalidationResult(
    NotFound("Could not extract headline from front"),
  )

  def renderEmailHeadline(faciaPage: PressedPage): Cached.CacheableResult = {
    val webTitle = for {
      topCollection <- faciaPage.collections.headOption
      topCurated <- topCollection.curatedPlusBackfillDeduplicated.headOption
    } yield RevalidatableResult.Ok(topCurated.properties.webTitle)

    webTitle.getOrElse {
      log.warn(s"headline not found for ${faciaPage.id}")
      headlineNotFound
    }
  }

}
