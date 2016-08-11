package controllers.admin.commercial

import common.dfp.TakeoverWithEmptyMPUs
import conf.Configuration.environment
import play.api.Play.current
import play.api.i18n.Messages.Implicits._
import play.api.mvc.{Action, Controller}

class TakeoverWithEmptyMPUsController extends Controller {

  def viewList() = Action { implicit request =>
    Ok(views.html.commercial.takeoverWithEmptyMPUs(
      environment.stage, TakeoverWithEmptyMPUs.fetchSorted())
    )
  }

  def viewForm() = Action { implicit request =>
    Ok(views.html.commercial.takeoverWithEmptyMPUsCreate(
      environment.stage, TakeoverWithEmptyMPUs.form)
    )
  }

  def create() = Action { implicit request =>
    TakeoverWithEmptyMPUs.form.bindFromRequest.fold(
      formWithErrors => {
        BadRequest(views.html.commercial.takeoverWithEmptyMPUsCreate(
          environment.stage, formWithErrors)
        )
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
