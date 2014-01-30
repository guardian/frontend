import common.CloudWatchApplicationMetrics
import conf.Management
import model.AdminLifecycle
import play.api.mvc.{Results, RequestHeader}
import scala.concurrent.Future

object Global extends AdminLifecycle with CloudWatchApplicationMetrics with Results {
  override lazy val applicationName = Management.applicationName

  override def onError(request: RequestHeader, ex: Throwable) = Future.successful(InternalServerError(
    views.html.errorPage(ex)
  ))
}
