package controllers.admin.commercial

import common.dfp.TakeoverWithEmptyMPUs
import model.{ApplicationContext, NoCache}
import play.api.i18n.Messages
import play.api.mvc.{Action, Controller}

class TakeoverWithEmptyMPUsController(implicit val messages: Messages, context: ApplicationContext) extends Controller {

  def viewList() = Action { implicit request =>
    NoCache(Ok(views.html.commercial.takeoverWithEmptyMPUs(TakeoverWithEmptyMPUs.fetchSorted())))
  }

  def viewForm() = Action { implicit request =>
    NoCache(Ok(views.html.commercial.takeoverWithEmptyMPUsCreate(TakeoverWithEmptyMPUs.form)))
  }

  def create() = Action { implicit request =>
    TakeoverWithEmptyMPUs.form.bindFromRequest.fold(
      formWithErrors => {
        NoCache(BadRequest(views.html.commercial.takeoverWithEmptyMPUsCreate(formWithErrors)))
      },
      takeover => {
        TakeoverWithEmptyMPUs.create(takeover)
        NoCache(Redirect(routes.TakeoverWithEmptyMPUsController.viewList()))
      }
    )
  }

  def remove(url: String) = Action { implicit request =>
    TakeoverWithEmptyMPUs.remove(url)
    NoCache(Redirect(routes.TakeoverWithEmptyMPUsController.viewList()))
  }
}
