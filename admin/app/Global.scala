import common.CloudWatchApplicationMetrics
import common.Logback.Logstash
import common.dfp.DfpAgentLifecycle
import conf.SwitchboardLifecycle
import controllers.AdminHealthCheckLifeCycle
import dfp.DfpDataCacheLifecycle
import model.AdminLifecycle
import ophan.SurgingContentAgentLifecycle
import play.api.mvc._
import purge.SoftPurge
import services.ConfigAgentLifecycle

import scala.concurrent.Future

object Global extends AdminLifecycle
  with ConfigAgentLifecycle
  with SwitchboardLifecycle
  with CloudWatchApplicationMetrics
  with Results
  with SurgingContentAgentLifecycle
  with DfpAgentLifecycle
  with DfpDataCacheLifecycle
  with SoftPurge
  with Logstash
  with AdminHealthCheckLifeCycle {

  override lazy val applicationName = "frontend-admin"

  override def onError(request: RequestHeader, ex: Throwable) = Future.successful(InternalServerError(
    views.html.errorPage(ex)
  ))
}
