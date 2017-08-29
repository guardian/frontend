package controllers.admin

import play.api.mvc.{BaseController, ControllerComponents}
import common.Logging
import model.{ApplicationContext, NoCache}

class SportTroubleshooterController(val controllerComponents: ControllerComponents)(implicit context: ApplicationContext) extends BaseController with Logging {

  def renderFootballTroubleshooter() = Action { implicit request =>
    NoCache(Ok(views.html.footballTroubleshooter()))
  }

  def renderCricketTroubleshooter() = Action { implicit request =>
    NoCache(Ok(views.html.cricketTroubleshooter()))
  }
}
