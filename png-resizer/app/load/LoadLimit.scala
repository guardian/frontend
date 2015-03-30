package load

import java.util.concurrent.atomic.AtomicInteger

import common.{ExecutionContexts, Logging}

import scala.concurrent.Future

object LoadLimit extends ExecutionContexts with Logging {

  private lazy val currentNumberOfRequests = new AtomicInteger(0)

  private lazy val currentNumberOfAlternativeRequests = new AtomicInteger(0)

  private lazy val requestLimit = {
    val limit = Runtime.getRuntime.availableProcessors()
    log.info(s"request limit set to $limit")
    limit
  }

  def tryOperation[T](alternativePool: Boolean)(operation: => Future[T])(outOfCapacity: => Future[T]): Future[T] = {
    val reqCounter = if (alternativePool) currentNumberOfAlternativeRequests else currentNumberOfRequests
    val concurrentRequests = reqCounter.incrementAndGet
    if (concurrentRequests <= requestLimit) try {
      log.info(s"AltPool: $alternativePool: Resize $concurrentRequests/$requestLimit")
      val result = operation
      result.onComplete{_ =>
        reqCounter.decrementAndGet()
      }
      result
    } catch {
      case t: Throwable =>
        reqCounter.decrementAndGet()
        throw t
    } else {
      reqCounter.decrementAndGet()
      outOfCapacity
    }
  }
}
