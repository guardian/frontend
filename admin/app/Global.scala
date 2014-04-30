import common.{Jobs, CloudWatchApplicationMetrics}
import conf.{Gzipper, Management}
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
  }

  def descheduleJobs() {
    Jobs.deschedule("FrontPressJob")
  }

  override def onStart(app: play.api.Application) {
    super.onStart(app)
    descheduleJobs()
    scheduleJobs()
  }

  override def onStop(app: play.api.Application) {
    descheduleJobs()
    super.onStop(app)
  }
}
