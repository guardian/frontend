import common.CloudWatchApplicationMetrics
import common.Logback.Logstash
import common.dfp.DfpAgentLifecycle
import conf.switches.SwitchboardLifecycle
import controllers.AdminHealthCheckLifeCycle
import dfp.DfpDataCacheLifecycle
import model.AdminLifecycle
import ophan.SurgingContentAgentLifecycle
import play.api.mvc._
import purge.SoftPurge
import services.ConfigAgentLifecycle

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
}
