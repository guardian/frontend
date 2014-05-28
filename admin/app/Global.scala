import common.{AkkaAsync, Jobs, CloudWatchApplicationMetrics}
import conf.{Gzipper, Management}
import dfp.DfpDataCacheJob
import jobs.RefreshFrontsJob
import model.AdminLifecycle
import play.api.mvc.{WithFilters, Results, RequestHeader}
import scala.concurrent.Future

object Global extends WithFilters(Gzipper) with AdminLifecycle with CloudWatchApplicationMetrics with Results {
  override lazy val applicationName = Management.applicationName

  override def onError(request: RequestHeader, ex: Throwable) = Future.successful(InternalServerError(
    views.html.errorPage(ex)
  ))

  def scheduleJobs() {
    //Every 3 minutes
    Jobs.schedule("FrontPressJob", "0 0/3 * 1/1 * ? *") {
      RefreshFrontsJob.run()
    }

    // every 30 minutes
    Jobs.schedule("DfpDataCacheJob", "0 1/30 * * * ? *") {
      DfpDataCacheJob.run()
    }
  }

  def descheduleJobs() {
    Jobs.deschedule("FrontPressJob")
    Jobs.deschedule("DfpDataCacheJob")
  }

  override def onStart(app: play.api.Application) {
    super.onStart(app)
    descheduleJobs()
    scheduleJobs()

    AkkaAsync {
      DfpDataCacheJob.run()
    }
  }

  override def onStop(app: play.api.Application) {
    descheduleJobs()
    super.onStop(app)
  }
}
