package controllers

import play.api.mvc.{Action, Controller}


object ResponsiveViewerController extends Controller {

  def preview(path: String) = Action{ Ok(views.html.responsive_viewer(path)) }

}
