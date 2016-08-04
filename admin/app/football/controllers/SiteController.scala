package controllers.admin

import common.ExecutionContexts
import model.Cached
import model.Cached.RevalidatableResult
import play.api.mvc._


class SiteController extends Controller with ExecutionContexts {

  def index =AuthActions.AuthActionTest { implicit request =>
    Cached(60)(RevalidatableResult.Ok(views.html.football.index()))
  }

}
