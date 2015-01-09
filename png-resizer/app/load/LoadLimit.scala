package load

import java.util.concurrent.atomic.AtomicInteger

import common.{ExecutionContexts, Logging}

import scala.concurrent.Future

object LoadLimit extends ExecutionContexts with Logging {

  private lazy val currentNumberOfRequests = new AtomicInteger(0)

  private lazy val requestLimit = {
    val limit = Runtime.getRuntime.availableProcessors()
    log.info(s"request limit set to $limit")
    limit
  }

  def tryOperation[T](operation: => Future[T])(outOfCapacity: => Future[T]): Future[T] = {
    val concurrentRequests = currentNumberOfRequests.incrementAndGet
    if (concurrentRequests <= requestLimit) try {
      log.info(s"Resize $concurrentRequests/$requestLimit")
      val result = operation
      result.onComplete{_ =>
        currentNumberOfRequests.decrementAndGet()
      }
      result
    } catch {
      case t: Throwable =>
        currentNumberOfRequests.decrementAndGet()
        throw t
    } else {
      currentNumberOfRequests.decrementAndGet()
      outOfCapacity
    }
  }
}
