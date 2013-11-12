package controllers.admin

import conf.Configuration
import play.api.mvc.{ Action, Controller }
import model.NoCache

object IndexController extends Controller {

  def index() = Action { Redirect("/admin") }

  def admin() = Authenticated { request =>
    NoCache(Ok(views.html.admin(Configuration.environment.stage)))
  }
}
