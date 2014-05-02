import common.{Jobs, AkkaAsync, CloudWatchApplicationMetrics}
import conf.{Management, Filters}
import dev.DevParametersLifecycle
import dfp.DfpAgent
import play.api.Application
import play.api.mvc.WithFilters

object Global extends WithFilters(Filters.common: _*) with DevParametersLifecycle
with CloudWatchApplicationMetrics {
  override lazy val applicationName = Management.applicationName

  override def onStart(app: Application) {
    super.onStart(app)

    Jobs.deschedule("DfpDataRefreshJob")
    Jobs.schedule("DfpDataRefreshJob", "0 1/30 * * * ?") {
      DfpAgent.refresh()
    }

    AkkaAsync {
      DfpAgent.refresh()
    }
  }

  override def onStop(app: Application) {
    Jobs.deschedule("DfpDataRefreshJob")
    DfpAgent.stop()

    super.onStop(app)
  }
}
