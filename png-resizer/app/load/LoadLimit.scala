package load

import java.util.concurrent.atomic.AtomicInteger

import common.Logging
import model.Cached
import play.api.mvc.Results._
import play.api.mvc._

import scala.concurrent.Future

object LoadLimit extends Logging {

  private lazy val currentNumberOfRequests = new AtomicInteger(0)
  private lazy val requestLimit = {
    val limit = Runtime.getRuntime.availableProcessors() * 2
    // one per cpu is too low as we have to wait for the content to download, so go for 2 per cpu
    log.info(s"request limit set to $limit")
    limit
  }

  def apply(fallbackUri: String)(available: =>  Future[Result]): Future[Result] = try {
    val requestsIncludingUs = currentNumberOfRequests.incrementAndGet
    if (requestsIncludingUs > requestLimit) {
      log.info(s"limit exceeded ($requestsIncludingUs) - redirecting to: $fallbackUri")
      Future.successful(Cached(60)(TemporaryRedirect(fallbackUri)))
    } else {
      log.info(s"capacity available - now at $requestsIncludingUs")
      available
    }
  } finally {
    currentNumberOfRequests.decrementAndGet
  }
}
