package controllers.admin

import common.ExecutionContexts
import model.Cached
import model.Cached.RevalidatableResult
import play.api.Environment
import play.api.mvc._


class SiteController (implicit env: Environment) extends Controller with ExecutionContexts {

  def index = Action { implicit request =>
    Cached(60)(RevalidatableResult.Ok(views.html.football.index()))
  }

}
