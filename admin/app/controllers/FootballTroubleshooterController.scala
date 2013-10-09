package controllers.admin

import play.api.mvc.Controller
import common.Logging
import conf.Configuration
import controllers.AuthLogging

object FootballTroubleshooterController extends Controller with Logging with AuthLogging {

  def renderFootballTroubleshooter() = Authenticated { implicit request =>
    Ok(views.html.footballTroubleshooter(Configuration.environment.stage))
  }
}
