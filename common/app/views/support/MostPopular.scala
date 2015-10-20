package views.support

import layout.FaciaContainer
import play.api.mvc.RequestHeader

object MostPopular extends implicits.Requests {

  def numItemsToShow(container: FaciaContainer)(implicit request: RequestHeader): Int = {
    if (container.commercialOptions.omitMPU) 9
    else 10
  }

  def showMPU(maybeContainer: Option[FaciaContainer]): Boolean = {
    !maybeContainer.exists(_.commercialOptions.omitMPU)
  }

  def tabsPaneCssClass(maybeContainer: Option[FaciaContainer]): String = {
    if (showMPU(maybeContainer)) "tabs__pane"
    else "tabs__pane--without-mpu"
  }
}
