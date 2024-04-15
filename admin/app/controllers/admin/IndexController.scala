package controllers.admin

import model.{ApplicationContext, NoCache}
import play.api.mvc._

class AdminIndexController(val controllerComponents: ControllerComponents)(implicit context: ApplicationContext)
    extends BaseController {

  def index(): Action[AnyContent] = Action { Redirect("/admin") }

  def admin(): Action[AnyContent] =
    Action { implicit request =>
      NoCache(Ok(views.html.admin()))
    }
}
