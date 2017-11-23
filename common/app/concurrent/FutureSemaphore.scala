package concurrent

import java.util.concurrent.Semaphore
import scala.concurrent.{ExecutionContext, Future}

class FutureSemaphore(maxOperations: Int)(implicit ec: ExecutionContext) {
  val semaphore = new Semaphore(maxOperations)

  def execute[A](task: => Future[A]): Future[A] = {
    if (semaphore.tryAcquire()) {
      val result = task
      result.foreach(_ => semaphore.release())
      result.failed.foreach(_ => semaphore.release())
      result
    } else {
      Future(throw new RuntimeException("Too many operations in progress, cannot execute task"))
    }
  }
}
