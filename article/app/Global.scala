import common.{Jobs, AkkaAsync, CloudWatchApplicationMetrics}
import conf.{Management, Filters}
import dev.DevParametersLifecycle
import dfp.DfpKeywordsAgent
import play.api.Application
import play.api.mvc.WithFilters

object Global extends WithFilters(Filters.common: _*) with DevParametersLifecycle
with CloudWatchApplicationMetrics {
  override lazy val applicationName = Management.applicationName

  override def onStart(app: Application) {
    super.onStart(app)

    Jobs.deschedule("DfpKeywordsRefreshJob")
    Jobs.schedule("DfpKeywordsRefreshJob", "0 1/15 * * * ?") {
      DfpKeywordsAgent.refresh()
    }

    AkkaAsync {
      DfpKeywordsAgent.refresh()
    }
  }

  override def onStop(app: Application) {
    Jobs.deschedule("DfpKeywordsRefreshJob")
    DfpKeywordsAgent.stop()

    super.onStop(app)
  }
}
