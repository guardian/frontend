package controllers

import play.api.mvc.{Action, Controller}
import conf.Configuration

object IndexController extends Controller {

  def index() = Action { Redirect("/admin") }

  def admin() = AuthAction { request =>
    Ok(views.html.admin(Configuration.environment.stage))
  }

}
