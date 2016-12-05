package controllers.admin

import play.api.mvc.{Action, Controller}
import common.Logging
import model.NoCache
import play.api.Environment

class SportTroubleshooterController (implicit env: Environment) extends Controller with Logging {

  def renderFootballTroubleshooter() = Action { implicit request =>
    NoCache(Ok(views.html.footballTroubleshooter()))
  }

  def renderCricketTroubleshooter() = Action { implicit request =>
    NoCache(Ok(views.html.cricketTroubleshooter()))
  }
}
