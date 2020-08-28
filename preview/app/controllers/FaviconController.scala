package controllers

import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents}

/*
 * Pointless controller, only here to work around a bug in the Play routes compiler.

 * If you try to point directly to controller.Assets.at(...) in routes
 * then you will get strange compilation errors like:
 * - patterns after a variable pattern cannot match (SLS 8.1.1)
 * - unreachable code due to variable pattern 'file'
 */
class FaviconController(assets: Assets, val controllerComponents: ControllerComponents) extends BaseController {
  def favicon: Action[AnyContent] = assets.at(path = "/public", file = "favicon.ico")
}
