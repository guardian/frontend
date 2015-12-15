package controllers

import common.{ExecutionContexts, Logging}
import controllers.admin.AuthActions
import play.api.data.Form
import play.api.data.Forms._
import play.api.mvc.Controller
import services.R2PagePressNotifier

case class R2PagePress(r2url: String) {
  lazy val trim = this.copy(r2url = r2url.trim)
}

object R2PressController extends Controller with Logging with AuthLogging with ExecutionContexts {

  val pressPageForm = Form(mapping("r2url" -> text)(R2PagePress.apply)(R2PagePress.unapply))

  def pressForm() = AuthActions.AuthActionTest { request =>
    Ok(views.html.pressR2(pressPageForm))
  }

  def press() = AuthActions.AuthActionTest { request =>
    pressPageForm.bindFromRequest().get.trim match {
      case R2PagePress(r2url) if r2url.nonEmpty  => R2PagePressNotifier.enqueue(r2url)
      case _ =>
    }

    SeeOther(routes.R2PressController.pressForm().url)
  }

}
