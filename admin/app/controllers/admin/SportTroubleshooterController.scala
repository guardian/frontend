package controllers.admin

import common.GuLogging
import model.{ApplicationContext, NoCache}
import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents}

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
