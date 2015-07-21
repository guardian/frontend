package controllers.admin.commercial

import common.dfp.TakeoverWithEmptyMPUs
import conf.Configuration.environment
import controllers.admin.AuthActions
import play.api.Play.current
import play.api.i18n.Messages.Implicits._
import play.api.mvc.Controller

object TakeoverWithEmptyMPUsController extends Controller {

  def viewList() = AuthActions.AuthActionTest {
    Ok(views.html.commercial.takeoverWithEmptyMPUs(
      environment.stage, TakeoverWithEmptyMPUs.fetchSorted())
    )
  }

  def viewForm() = AuthActions.AuthActionTest {
    Ok(views.html.commercial.takeoverWithEmptyMPUsCreate(
      environment.stage, TakeoverWithEmptyMPUs.form)
    )
  }

  def create() = AuthActions.AuthActionTest { implicit request =>
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

  def remove(url: String) = AuthActions.AuthActionTest { implicit request =>
    TakeoverWithEmptyMPUs.remove(url)
    Redirect(routes.TakeoverWithEmptyMPUsController.viewList())
  }
}
