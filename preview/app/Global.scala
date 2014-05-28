import common.ExecutionContexts
import conf.Filters
import feed.OnwardJourneyLifecycle
import play.api.mvc._
import scala.concurrent.Future
import services.ConfigAgentLifecycle

// OBVIOUSLY this is only for the preview server
// NOT to be used elsewhere...
object NoCacheFilter extends Filter with ExecutionContexts {
  override def apply(nextFilter: (RequestHeader) => Future[SimpleResult])(request: RequestHeader): Future[SimpleResult] =
    nextFilter(request).map(_.withHeaders("Cache-Control" -> "no-cache"))
}

object Global extends WithFilters(NoCacheFilter :: Filters.common: _*) with CommercialLifecycle
                                                      with OnwardJourneyLifecycle
                                                      with ConfigAgentLifecycle
