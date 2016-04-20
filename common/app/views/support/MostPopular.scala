package views.support

import layout.FaciaContainer

object MostPopular extends implicits.Requests {

  def showMPU(maybeContainer: Option[FaciaContainer]): Boolean = {
    !maybeContainer.exists(_.commercialOptions.omitMPU)
  }

  def tabsPaneCssClass(maybeContainer: Option[FaciaContainer]): String = {
    if (showMPU(maybeContainer)) "tabs__pane"
    else "tabs__pane--without-mpu"
  }
}
