package controllers.admin.commercial

import conf.Configuration.environment
import controllers.admin.AuthActions
import model.admin.commercial.TakeoverWithEmptyMPUs
import play.api.mvc.Controller

object TakeoverWithEmptyMPUsController extends Controller {

  def viewList() = AuthActions.AuthActionTest {
    Ok(views.html.commercial.takeoverWithEmptyMPUs(
      environment.stage, TakeoverWithEmptyMPUs.fetch())
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
