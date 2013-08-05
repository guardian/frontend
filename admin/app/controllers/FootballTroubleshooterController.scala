package controllers

import play.api.mvc.Controller
import common.Logging
import conf.Configuration

object FootballTroubleshooterController extends Controller with Logging with AuthLogging {

  def render() = AuthAction{ implicit request =>
      Ok(views.html.footballTroubleshooter(Configuration.environment.stage))
  }
}
