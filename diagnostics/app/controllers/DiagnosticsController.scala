package controllers

import common._
import model.TinyResponse
import model.diagnostics.analytics.Analytics
import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents}

class DiagnosticsController(val controllerComponents: ControllerComponents) extends BaseController with GuLogging {
  val r = scala.util.Random

  def analytics(prefix: String): Action[AnyContent] =
    Action { implicit request =>
      Analytics.report(prefix)
      TinyResponse.gif
    }
}
