package services.dotcomrendering

import common.GuLogging
import crosswords.CrosswordPageWithContent
import model.Cors.RichRequestHeader
import play.api.mvc.RequestHeader
import utils.DotcomponentsLogger

object CrosswordsPicker extends GuLogging {

  /**
    *
    * Add to this function any logic for including/excluding
    * a crossword page from being rendered with DCR
    *
    * Currently defaulting to false until we implement crosswords in DCR
    *
    * */
  private def dcrCouldRender(crosswordPageWithContent: CrosswordPageWithContent): Boolean = {
    false
  }

  def getTier(
      crosswordPageWithContent: CrosswordPageWithContent,
  )(implicit
      request: RequestHeader,
  ): RenderType = {

    val participatingInTest = false // until we create a test for this content type
    val dcrCanRender = dcrCouldRender(crosswordPageWithContent)

    val tier = {
      if (request.forceDCROff) LocalRender
      else if (request.forceDCR) RemoteRender
      else if (dcrCanRender && participatingInTest) RemoteRender
      else LocalRender
    }

    if (tier == RemoteRender) {
      DotcomponentsLogger.logger.logRequest(
        s"path executing in dotcomponents",
        Map.empty,
        crosswordPageWithContent.item,
      )
    } else {
      DotcomponentsLogger.logger.logRequest(s"path executing in web", Map.empty, crosswordPageWithContent.item)
    }

    tier
  }
}
