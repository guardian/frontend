package controllers.admin

import controllers.Assets
import play.api.mvc.ControllerComponents

class UncachedAssets(
    val controllerComponents: ControllerComponents,
    val assets: Assets,
) extends controllers.PublicAssets

class UncachedWebAssets(
    val controllerComponents: ControllerComponents,
    val assets: Assets,
) extends controllers.PublicAssets
