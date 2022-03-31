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

    val properties =
      Map(
        "participatingInTest" -> participatingInTest.toString,
        "dcrCouldRender" -> dcrCouldRender.toString,
        "isFront" -> "true",
      )

    if (request.forceDCROff) {
      DotcomFrontsLogger.logger.logRequest(s"front executing in web: $path, $properties", properties, faciaPage)
      LocalRender
    } else if (request.forceDCR) {
      DotcomFrontsLogger.logger.logRequest(s"front executing in dotcomcomponents: $path, $properties", properties, faciaPage)
      RemoteRender
    } else if (participatingInTest && dcrCouldRender) {
      DotcomFrontsLogger.logger.logRequest(s"front executing in dotcomcomponents: $path, $properties", properties, faciaPage)
      RemoteRender
    } else {
      DotcomFrontsLogger.logger.logRequest(s"front executing in web: $path, $properties", properties, faciaPage)
      LocalRender
    }
  }

}

object FaciaPicker extends FaciaPicker


