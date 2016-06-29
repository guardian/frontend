package controllers

import play.api.mvc.Controller

/*
 * Pointless controller, only here to work around a bug in the Play routes compiler.

 * If you try to point directly to controller.Assets.at(...) in standalone.routes
 * then you will get strange compilation errors like:
 * - patterns after a variable pattern cannot match (SLS 8.1.1)
 * - unreachable code due to variable pattern 'file'
 */
class FaviconController extends Controller {
  def favicon = Assets.at(path="/public", file="favicon.ico")
}
