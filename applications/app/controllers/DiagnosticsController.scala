package controllers

import model.Cached.RevalidatableResult
import model.{ApplicationContext, Cached, DiagnosticsPageMetadata}
import pages.TagIndexHtmlPage
import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents}

class DiagnosticsController(val controllerComponents: ControllerComponents)(implicit context: ApplicationContext)
    extends BaseController
    with common.ImplicitControllerExecutionContext {

  def renderDiagnosticsPage(): Action[AnyContent] =
    Action { implicit request =>
      Cached(300) {
        RevalidatableResult.Ok(TagIndexHtmlPage.html(new DiagnosticsPageMetadata()))
      }
    }
}
