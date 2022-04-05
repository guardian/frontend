package utils

import common.GuLogging
import experiments.{ActiveExperiments, FrontRendering}
import implicits.Requests._
import model.PressedPage
import play.api.mvc.RequestHeader

class FaciaPicker extends GuLogging {

  // we don't yet use these parameters but they will play into dcrCouldRender later on
  def getTier(faciaPage: PressedPage, path: String)(implicit request: RequestHeader): RenderType = {
    val participatingInTest = ActiveExperiments.isParticipating(FrontRendering)
    val dcrCouldRender = false

    val tier = if (request.forceDCROff) {
      LocalRender
    } else if (request.forceDCR) {
      RemoteRender
    } else if (participatingInTest && dcrCouldRender) {
      RemoteRender
    } else {
      LocalRender
    }

    logTier(faciaPage, path, participatingInTest, dcrCouldRender, tier)

    tier
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
