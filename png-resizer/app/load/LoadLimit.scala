package load

import java.util.concurrent.atomic.AtomicInteger

import common.{ExecutionContexts, Logging}
import play.api.mvc._

import scala.concurrent.Future

object LoadLimit extends ExecutionContexts with Logging {

  private lazy val currentNumberOfRequests = new AtomicInteger(0)

  // temporary count just to check things are working as expected
  private lazy val currentNumberOfResizes = new AtomicInteger(0)

  private lazy val requestLimit = {
    val limit = Runtime.getRuntime.availableProcessors()
    log.info(s"request limit set to $limit")
    limit
  }

  def apply(onFailure: => Future[Result])(available: =>  Future[Result]): Future[Result] = try {
    val concurrentRequests = currentNumberOfRequests.incrementAndGet
    if (concurrentRequests <= requestLimit) try {
      log.info(s"Resize ${currentNumberOfResizes.incrementAndGet()}/$requestLimit")
      val result = available
      result.onComplete{_ =>
        currentNumberOfRequests.decrementAndGet()
        currentNumberOfResizes.decrementAndGet()
      }
      result
    } catch {
      case t: Throwable =>
        currentNumberOfRequests.decrementAndGet()
        throw t
    } else {
      currentNumberOfRequests.decrementAndGet()
      onFailure
    }
  }
}
