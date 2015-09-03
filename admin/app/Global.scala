import common.CloudWatchApplicationMetrics
import common.dfp.DfpAgentLifecycle
import conf.{Gzipper, SwitchboardLifecycle}
import dfp.DfpDataCacheLifecycle
import model.AdminLifecycle
import ophan.SurgingContentAgentLifecycle
import play.api.mvc.{RequestHeader, Results, WithFilters}
import purge.SoftPurge
import services.ConfigAgentLifecycle

import scala.concurrent.Future

object Global extends WithFilters(Gzipper)
  with AdminLifecycle
  with ConfigAgentLifecycle
  with SwitchboardLifecycle
  with CloudWatchApplicationMetrics
  with Results
  with SurgingContentAgentLifecycle
  with DfpAgentLifecycle
  with DfpDataCacheLifecycle
  with SoftPurge {

  override lazy val applicationName = "frontend-admin"

  override def onError(request: RequestHeader, ex: Throwable) = Future.successful(InternalServerError(
    views.html.errorPage(ex)
  ))
}
