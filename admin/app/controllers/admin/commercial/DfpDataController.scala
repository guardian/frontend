package controllers.admin.commercial

import common.ExecutionContexts
import conf.Configuration.environment
import controllers.admin.AuthActions
import dfp.DfpDataCacheJob
import model.NoCache
import play.api.mvc.{Action, AnyContent, Controller}

class DfpDataController extends Controller with ExecutionContexts {

  def renderCacheFlushPage(): Action[AnyContent] = AuthActions.AuthActionTest { implicit request =>
    NoCache(Ok(views.html.commercial.dfpFlush(environment.stage)))
  }

  def flushCache(): Action[AnyContent] = AuthActions.AuthActionTest { implicit request =>
    DfpDataCacheJob.refreshAllDfpData()
    NoCache(Redirect(routes.DfpDataController.renderCacheFlushPage()))
      .flashing("triggered" -> "true")
  }

}
