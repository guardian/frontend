package controllers.admin

import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents}
import common.GuLogging
import model.{ApplicationContext, NoCache}

class SportTroubleshooterController(val controllerComponents: ControllerComponents)(implicit
    context: ApplicationContext,
) extends BaseController
    with GuLogging {

  def renderFootballTroubleshooter(): Action[AnyContent] =
    Action { implicit request =>
      NoCache(Ok(views.html.footballTroubleshooter()))
    }

  def renderCricketTroubleshooter(): Action[AnyContent] =
    Action { implicit request =>
      NoCache(Ok(views.html.cricketTroubleshooter()))
    }
}
