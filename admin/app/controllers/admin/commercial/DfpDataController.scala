package controllers.admin.commercial

import common.ExecutionContexts
import controllers.admin.AuthActions
import dfp.DfpDataCacheJob
import model.NoCache
import play.api.mvc.{Action, AnyContent, Controller}

object DfpDataController extends Controller with ExecutionContexts {

  def flushCache(): Action[AnyContent] = AuthActions.AuthActionTest { implicit request =>
    DfpDataCacheJob.run()
    NoCache(Ok("All cached DFP data is being refreshed."))
  }

}
