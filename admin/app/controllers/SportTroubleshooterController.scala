package controllers.admin

import play.api.mvc.{Action, Controller}
import common.Logging
import model.{ApplicationContext, NoCache}

class SportTroubleshooterController (implicit context: ApplicationContext) extends Controller with Logging {

  def renderFootballTroubleshooter() = Action { implicit request =>
    NoCache(Ok(views.html.footballTroubleshooter()))
  }

  def renderCricketTroubleshooter() = Action { implicit request =>
    NoCache(Ok(views.html.cricketTroubleshooter()))
  }
}
