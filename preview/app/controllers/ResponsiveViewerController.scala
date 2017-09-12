package controllers

import play.api.mvc.{BaseController, ControllerComponents}


class ResponsiveViewerController(val controllerComponents: ControllerComponents) extends BaseController {

  def preview(path: String) = Action{ Ok(views.html.responsive_viewer(path)) }

}
