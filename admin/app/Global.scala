import common.CloudWatchApplicationMetrics
import conf.Gzipper
import dfp.DfpDataCacheLifecycle
import model.AdminLifecycle
import ophan.SurgingContentAgentLifecycle
import play.api.mvc.{WithFilters, Results, RequestHeader}
import scala.concurrent.Future

object Global extends WithFilters(Gzipper)
  with AdminLifecycle
  with CloudWatchApplicationMetrics
  with Results
  with SurgingContentAgentLifecycle
  with DfpDataCacheLifecycle {

  override lazy val applicationName = "frontend-admin"

  override def onError(request: RequestHeader, ex: Throwable) = Future.successful(InternalServerError(
    views.html.errorPage(ex)
  ))
}
