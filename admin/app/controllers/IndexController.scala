package controllers

import conf.Configuration
import play.api.mvc.{ Action, Controller }

object IndexController extends Controller {

  def index() = Action { Redirect("/admin") }

  def admin() = Authenticated { request =>
    Ok(views.html.admin(Configuration.environment.stage))
  }
}
