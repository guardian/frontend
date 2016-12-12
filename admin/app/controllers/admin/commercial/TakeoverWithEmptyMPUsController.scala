package controllers.admin.commercial

import common.dfp.TakeoverWithEmptyMPUs
import model.ApplicationContext
import play.api.i18n.Messages
import play.api.mvc.{Action, Controller}

class TakeoverWithEmptyMPUsController(implicit val messages: Messages, context: ApplicationContext) extends Controller {
  import context._

  def viewList() = Action { implicit request =>
    Ok(views.html.commercial.takeoverWithEmptyMPUs(TakeoverWithEmptyMPUs.fetchSorted()))
  }

  def viewForm() = Action { implicit request =>
    Ok(views.html.commercial.takeoverWithEmptyMPUsCreate(TakeoverWithEmptyMPUs.form))
  }

  def create() = Action { implicit request =>
    TakeoverWithEmptyMPUs.form.bindFromRequest.fold(
      formWithErrors => {
        BadRequest(views.html.commercial.takeoverWithEmptyMPUsCreate(formWithErrors))
      },
      takeover => {
        TakeoverWithEmptyMPUs.create(takeover)
        Redirect(routes.TakeoverWithEmptyMPUsController.viewList())
      }
    )
  }

  def remove(url: String) = Action { implicit request =>
    TakeoverWithEmptyMPUs.remove(url)
    Redirect(routes.TakeoverWithEmptyMPUsController.viewList())
  }
}
