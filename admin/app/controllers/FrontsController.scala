package controllers

import play.api.mvc.Controller
import conf.Configuration

object FrontsController extends Controller {

  def index() = AuthAction{ request =>
    Ok(views.html.fronts(Configuration.environment.stage))
  }

}
