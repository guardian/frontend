import common.CloudWatchApplicationMetrics
import conf.Management
import model.AdminLifecycle

object Global extends AdminLifecycle with CloudWatchApplicationMetrics {
  override lazy val applicationName = Management.applicationName
}
