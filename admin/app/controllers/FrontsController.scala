package controllers

import play.api.mvc.{Action, Controller}
import conf.AdminConfiguration

object FrontsController extends Controller {

  def index() = AuthAction{ request =>
    Ok(views.html.fronts(AdminConfiguration.environment.stage))
  }

}
