package controllers.admin

import play.api.mvc.ControllerComponents
import controllers.Assets

class UncachedAssets(
    val controllerComponents: ControllerComponents,
    val assets: Assets,
) extends controllers.PublicAssets

class UncachedWebAssets(
    val controllerComponents: ControllerComponents,
    val assets: Assets,
) extends controllers.PublicAssets
