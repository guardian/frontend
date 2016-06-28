package controllers

import play.api.mvc.{Action, Controller}


class ResponsiveViewerController extends Controller {

  def preview(path: String) = Action{ Ok(views.html.responsive_viewer(path)) }

}
