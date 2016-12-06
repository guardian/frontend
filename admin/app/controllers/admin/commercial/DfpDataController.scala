package controllers.admin.commercial

import common.ExecutionContexts
import dfp.DfpDataCacheJob
import model.NoCache
import play.api.Environment
import play.api.mvc.{Action, AnyContent, Controller}

class DfpDataController (implicit env: Environment) extends Controller with ExecutionContexts {

  def renderCacheFlushPage(): Action[AnyContent] = Action { implicit request =>
    NoCache(Ok(views.html.commercial.dfpFlush()))
  }

  def flushCache(): Action[AnyContent] = Action { implicit request =>
    DfpDataCacheJob.refreshAllDfpData()
    NoCache(Redirect(routes.DfpDataController.renderCacheFlushPage()))
      .flashing("triggered" -> "true")
  }

}
