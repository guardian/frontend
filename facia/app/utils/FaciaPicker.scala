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
      LocalRender
    } else if (request.forceDCR) {
      log.info(s"Front rendered by DCR: $path, $properties")
      RemoteRender
    } else if (participatingInTest && dcrCouldRender) {
      RemoteRender
    } else {
      LocalRender
    }
  }

}

object FaciaPicker extends FaciaPicker


