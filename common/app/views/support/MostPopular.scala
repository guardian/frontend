package views.support

import layout.FaciaContainer

object MostPopular extends implicits.Requests {

  def isAdFree(maybeContainer: Option[FaciaContainer]): Boolean = {
    maybeContainer.exists(_.commercialOptions.adFree)
  }

  def showMPU(maybeContainer: Option[FaciaContainer]): Boolean = {
    !isAdFree(maybeContainer)
  }

  def tabsPaneCssClass(maybeContainer: Option[FaciaContainer]): String = {
    if (showMPU(maybeContainer)) "tabs__pane"
    else "tabs__pane--without-mpu"
  }
}
