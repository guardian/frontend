import common.CloudWatchApplicationMetrics
import common.dfp.DfpAgentLifecycle
import conf.Gzipper
import dfp.DfpDataCacheLifecycle
import model.AdminLifecycle
import ophan.SurgingContentAgentLifecycle
import play.api.mvc.{RequestHeader, Results, WithFilters}

import scala.concurrent.Future

object Global extends WithFilters(Gzipper)
  with AdminLifecycle
  with CloudWatchApplicationMetrics
  with Results
  with SurgingContentAgentLifecycle
  with DfpAgentLifecycle
  with DfpDataCacheLifecycle {

  override lazy val applicationName = "frontend-admin"

  override def onError(request: RequestHeader, ex: Throwable) = Future.successful(InternalServerError(
    views.html.errorPage(ex)
  ))
}
