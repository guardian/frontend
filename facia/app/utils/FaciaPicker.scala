package utils

import common.GuLogging
import experiments.{ActiveExperiments, FrontRendering}
import implicits.Requests._
import model.PressedPage
import play.api.mvc.RequestHeader

class FaciaPicker extends GuLogging {

  val SUPPORTED_COLLECTIONS: Set[String] =
    Set("dynamic/fast", "dynamic/slow", "fixed/small/slow-IV", "fixed/large/slow-XIV")

  def dcrSupportsAllCollectionTypes(faciaPage: PressedPage): Boolean = {
    faciaPage.collections.forall(collection => SUPPORTED_COLLECTIONS.contains(collection.collectionType))
  }

  def getTier(faciaPage: PressedPage, path: String)(implicit request: RequestHeader): RenderType = {
    val participatingInTest = ActiveExperiments.isParticipating(FrontRendering)
    val dcrCouldRender = dcrSupportsAllCollectionTypes(faciaPage)

    val tier = decideTier(request.forceDCROff, request.forceDCR, participatingInTest, dcrCouldRender)

    logTier(faciaPage, path, participatingInTest, dcrCouldRender, tier)

    tier
  }

  def decideTier(
      forceDCROff: Boolean,
      forceDCR: Boolean,
      participatingInTest: Boolean,
      dcrCouldRender: Boolean,
  ): RenderType = {
    if (forceDCROff) {
      LocalRender
    } else if (forceDCR) {
      RemoteRender
    } else if (participatingInTest && dcrCouldRender) {
      RemoteRender
    } else {
      LocalRender
    }
  }

  def logTier(
      faciaPage: PressedPage,
      path: String,
      participatingInTest: Boolean,
      dcrCouldRender: Boolean,
      tier: RenderType,
  )(implicit request: RequestHeader): Unit = {
    val tierReadable = if (tier == RemoteRender) "dotcomcomponents" else "web";
    val properties =
      Map(
        "participatingInTest" -> participatingInTest.toString,
        "dcrCouldRender" -> dcrCouldRender.toString,
        "isFront" -> "true",
        "tier" -> tierReadable,
      )

    DotcomFrontsLogger.logger.logRequest(s"front executing in $tierReadable: $path, $properties", properties, faciaPage)
  }
}

object FaciaPicker extends FaciaPicker
