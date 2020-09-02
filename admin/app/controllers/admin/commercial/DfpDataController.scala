package controllers.admin.commercial

import common.ImplicitControllerExecutionContext
import dfp.DfpDataCacheJob
import model.{ApplicationContext, NoCache}
import play.api.mvc._

class DfpDataController(val controllerComponents: ControllerComponents, dfpDataCacheJob: DfpDataCacheJob)(implicit
    context: ApplicationContext,
) extends BaseController
    with ImplicitControllerExecutionContext {

  def renderCacheFlushPage(): Action[AnyContent] =
    Action { implicit request =>
      NoCache(Ok(views.html.commercial.dfpFlush()))
    }

  def flushCache(): Action[AnyContent] =
    Action { implicit request =>
      dfpDataCacheJob.refreshAllDfpData()
      NoCache(Redirect(routes.DfpDataController.renderCacheFlushPage()))
        .flashing("triggered" -> "true")
    }

}
