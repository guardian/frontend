package controllers

import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents}

class ResponsiveViewerController(val controllerComponents: ControllerComponents) extends BaseController {

  def preview(path: String): Action[AnyContent] = Action { Ok(views.html.responsive_viewer(path)) }

}
