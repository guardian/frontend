package controllers.admin

import play.api.mvc.{Action, Controller}
import common.Logging
import conf.Configuration
import controllers.AuthLogging
import model.NoCache

class SportTroubleshooterController extends Controller with Logging with AuthLogging {

  def renderFootballTroubleshooter() = Action { implicit request =>
    NoCache(Ok(views.html.footballTroubleshooter(Configuration.environment.stage)))
  }

  def renderCricketTroubleshooter() = Action { implicit request =>
    NoCache(Ok(views.html.cricketTroubleshooter(Configuration.environment.stage)))
  }
}
