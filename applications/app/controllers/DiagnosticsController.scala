package controllers

import model.Cached.RevalidatableResult
import model.{ApplicationContext, Cached, DiagnosticsPageMetadata}
import pages.TagIndexHtmlPage
import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents}

/** Browser diagnostics was introduced as a temporary page on 15/09/2025 If you still see this comment in 2026, please
  * notify @cemms1 or feel free to remove See https://github.com/guardian/frontend/pull/28220
  */
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
