package controllers.admin

import play.api.mvc.Controller
import common.Logging
import model.NoCache
import controllers.AuthLogging
import conf.Configuration

object CommercialController extends Controller with Logging with AuthLogging {

  def renderCommercial = Authenticated { implicit request =>
    NoCache(Ok(views.html.commercial(Configuration.environment.stage)))
  }

}
