package controllers

import common.{GuLogging, ImplicitControllerExecutionContext}
import model._

import play.api.mvc._

class FootballController()(implicit context: ApplicationContext)
    extends BaseController
    with ImplicitControllerExecutionContext
    with GuLogging {

  /*def renderPage(competitionTag: String): Action[AnyContent] =
    Action { implicit request =>
      print(competitionTag)
    }*/

  def renderPage(competitionTag: String): Unit = {
    print(competitionTag)
  }

  override protected def controllerComponents: ControllerComponents = ???
}
